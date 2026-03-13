import Groq from "groq-sdk";
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

function buildSystemPrompt(ctx: UserContext): string {
  const medsStr =
    ctx.medications.length > 0
      ? ctx.medications.map((m) => `${m.name} (${m.dosage || "unknown dose"}, ${m.frequency || "unknown frequency"})`).join(", ")
      : "None recorded";

  return `You are MediAssist, a friendly health companion for elderly patients.
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

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAI(
  userId: string,
  message: string,
  imageBase64: string | null,
  history: HistoryMessage[]
): Promise<string> {
  const ctx = await getUserContext(userId);
  const systemPrompt = buildSystemPrompt(ctx);

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
  imageBase64: string
): Promise<{ drugs: { name: string; dosage: string; frequency: string; instructions: string }[]; raw_text: string }> {
  const ctx = await getUserContext(userId);

  const scanPrompt = `${buildSystemPrompt(ctx)}

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
