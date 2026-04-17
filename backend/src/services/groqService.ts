import Groq, { toFile } from "groq-sdk";
import { supabaseAdmin } from "../middleware/authenticate";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEXT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

interface UserContext {
  username: string | null;
  age: number | null;
  blood_group: string | null;
  conditions: string[];
  allergies: string[];
  medications: { name: string; dosage: string | null; frequency: string | null }[];
}

async function getUserContext(userId: string): Promise<UserContext> {
  try {
    const [userRes, medicalRes, medsRes] = await Promise.all([
      supabaseAdmin.from("users").select("username, age, blood_group").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("medical_profiles").select("conditions, allergies").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("medications").select("name, dosage, frequency").eq("user_id", userId).eq("is_active", true),
    ]);

    return {
      username: userRes.data?.username ?? null,
      age: userRes.data?.age ?? null,
      blood_group: userRes.data?.blood_group ?? null,
      conditions: medicalRes.data?.conditions ?? [],
      allergies: medicalRes.data?.allergies ?? [],
      medications: (medsRes.data ?? []).map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      })),
    };
  } catch {
    return {
      username: null,
      age: null,
      blood_group: null,
      conditions: [],
      allergies: [],
      medications: [],
    };
  }
}

type LanguageCode = "en" | "hi" | "mr";

function languageInstruction(lang: LanguageCode): string {
  switch (lang) {
    case "hi":
      return "IMPORTANT: Respond entirely in Hindi (हिन्दी) using the Devanagari script. Keep drug/medicine names in their original brand form. All sentences, greetings, and explanations MUST be in Hindi.";
    case "mr":
      return "IMPORTANT: Respond entirely in Marathi (मराठी) using the Devanagari script. Keep drug/medicine names in their original brand form. All sentences, greetings, and explanations MUST be in Marathi.";
    case "en":
    default:
      return "Respond in clear, simple English.";
  }
}

function buildSystemPrompt(ctx: UserContext, language: LanguageCode = "en"): string {
  const medsStr =
    ctx.medications.length > 0
      ? ctx.medications.map((m) => `${m.name} (${m.dosage || "unknown dose"}, ${m.frequency || "unknown frequency"})`).join(", ")
      : "None recorded";

  return `You are Nuva, a friendly health companion for elderly patients.
${languageInstruction(language)}
Always respond in simple, clear language. No medical jargon.
User profile: Name=${ctx.username || "Unknown"}, Age=${ctx.age || "Unknown"}, Blood Group=${ctx.blood_group || "Unknown"}.
Known conditions: ${ctx.conditions.length > 0 ? ctx.conditions.join(", ") : "None recorded"}.
Known allergies: ${ctx.allergies.length > 0 ? ctx.allergies.join(", ") : "None recorded"}.
Current medications: ${medsStr}.
If the user sends an image, analyze it as a prescription or medicine label.
Extract: drug names, dosage, frequency, special instructions, warnings.
Format prescription results as a clean structured list.
NEVER diagnose conditions. Always recommend consulting a doctor for serious issues.
Be warm, patient, encouraging, and concise. Responses max 150 words unless listing drugs.`;
}

function normalizeLanguage(lang: unknown): LanguageCode {
  if (lang === "hi" || lang === "mr") return lang;
  return "en";
}

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAI(
  userId: string,
  message: string,
  imageBase64: string | null,
  history: HistoryMessage[],
  language: unknown = "en"
): Promise<string> {
  const ctx = await getUserContext(userId);
  const lang = normalizeLanguage(language);
  const systemPrompt = buildSystemPrompt(ctx, lang);

  const useVision = !!imageBase64;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of history.slice(-20)) {
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }

  if (useVision) {
    const imageUrl = imageBase64!.startsWith("data:")
      ? imageBase64!
      : `data:image/jpeg;base64,${imageBase64}`;

    messages.push({
      role: "user",
      content: [
        { type: "text", text: message },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    });
  } else {
    messages.push({ role: "user", content: message });
  }

  const completion = await groq.chat.completions.create({
    messages,
    model: useVision ? VISION_MODEL : TEXT_MODEL,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

export async function scanPrescription(
  userId: string,
  imageBase64: string,
  language: unknown = "en"
): Promise<{ drugs: { name: string; dosage: string; frequency: string; instructions: string }[]; raw_text: string }> {
  const ctx = await getUserContext(userId);
  const lang = normalizeLanguage(language);

  const scanPrompt = `${buildSystemPrompt(ctx, lang)}

Analyze this prescription or medicine label image carefully.
Extract ALL drugs/medications visible and return ONLY a valid JSON object in this exact format (no markdown, no backticks, just pure JSON):
{
  "drugs": [
    {
      "name": "Drug Name",
      "dosage": "dose amount and unit",
      "frequency": "how often to take",
      "instructions": "special instructions or warnings"
    }
  ],
  "raw_text": "complete text visible in the image"
}
If you cannot read the image clearly, return: {"drugs": [], "raw_text": "Could not read the prescription clearly. Please try taking a clearer photo."}`;

  const imageUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: scanPrompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    model: VISION_MODEL,
    temperature: 0.3,
    max_tokens: 2048,
  });

  const text = (completion.choices[0]?.message?.content || "").trim();

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      drugs: [],
      raw_text: text || "Could not analyze the prescription.",
    };
  }
}

const WHISPER_MODEL = "whisper-large-v3";

function whisperLanguageHint(language: unknown): string | undefined {
  const lang = normalizeLanguage(language);
  if (lang === "en") return "en";
  if (lang === "hi") return "hi";
  if (lang === "mr") return "mr";
  return undefined;
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string | undefined,
  language: unknown = "en"
): Promise<string> {
  const cleanedBase64 = audioBase64.includes(",") ? audioBase64.split(",").pop()! : audioBase64;
  const buffer = Buffer.from(cleanedBase64, "base64");
  const ext = (() => {
    const m = (mimeType || "").toLowerCase();
    if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "m4a";
    if (m.includes("wav")) return "wav";
    if (m.includes("webm")) return "webm";
    if (m.includes("ogg")) return "ogg";
    if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
    return "m4a";
  })();

  const file = await toFile(buffer, `audio.${ext}`);

  const langHint = whisperLanguageHint(language);

  const completion = await groq.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    ...(langHint ? { language: langHint } : {}),
    response_format: "text",
    temperature: 0,
  });

  const result = completion as unknown as string | { text?: string };
  if (typeof result === "string") return result.trim();
  return ((result?.text) || "").trim();
}
