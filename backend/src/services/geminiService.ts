import {
  GoogleGenerativeAI,
  Content,
  Part,
} from "@google/generative-ai";
import { supabaseAdmin } from "../middleware/authenticate";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    // Return empty context if DB is unavailable or user doesn't exist yet
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

  return `You are Nuva, a friendly health companion for elderly patients.
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

export async function chatWithGemini(
  userId: string,
  message: string,
  imageBase64: string | null,
  history: HistoryMessage[]
): Promise<string> {
  const ctx = await getUserContext(userId);
  const systemPrompt = buildSystemPrompt(ctx);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const contents: Content[] = [];

  contents.push({ role: "user", parts: [{ text: systemPrompt }] });
  contents.push({ role: "model", parts: [{ text: "Understood. I'm Nuva, ready to help!" }] });

  for (const msg of history.slice(-20)) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  const userParts: Part[] = [];
  if (message) {
    userParts.push({ text: message });
  }
  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/jpeg";
    const data = match ? match[2] : imageBase64;
    userParts.push({ inlineData: { mimeType, data } });
  }
  contents.push({ role: "user", parts: userParts });

  const result = await model.generateContent({ contents });
  const response = result.response;
  return response.text();
}

export async function scanPrescription(
  userId: string,
  imageBase64: string
): Promise<{ drugs: { name: string; dosage: string; frequency: string; instructions: string }[]; raw_text: string }> {
  const ctx = await getUserContext(userId);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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

  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  const mimeType = match ? match[1] : "image/jpeg";
  const data = match ? match[2] : imageBase64;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: scanPrompt },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
  });

  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      drugs: [],
      raw_text: text,
    };
  }
}
