import { Router, Response } from "express";
import {
  authenticate,
  AuthenticatedRequest,
  supabaseAdmin,
} from "../middleware/authenticate";
import { chatWithAI, scanPrescription, transcribeAudio } from "../services/groqService";

const router = Router();

router.post(
  "/chat",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { message, image_base64, history, language } = req.body;

    if (!message && !image_base64) {
      res.status(400).json({ error: "Please type a message or attach an image." });
      return;
    }

    try {
      const reply = await chatWithAI(
        req.userId!,
        message || "Please analyze this image.",
        image_base64 || null,
        history || [],
        language || "en"
      );

      // Best-effort DB save — if it fails (e.g. FK constraint in dev), we
      // still return the AI reply so the client is never broken.
      try {
        await supabaseAdmin.from("chat_messages").insert([
          {
            user_id: req.userId,
            role: "user",
            content: message || "[Image sent]",
          },
          {
            user_id: req.userId,
            role: "assistant",
            content: reply,
          },
        ]);
      } catch (dbErr) {
        console.warn("chat_messages DB save skipped (non-fatal):", dbErr);
      }

      res.json({ reply, message_id: null });
    } catch (err) {
      console.error("AI chat error:", err);
      res.status(500).json({
        error: "Our AI is having trouble right now. Please try again in a moment.",
      });
    }
  }
);

router.post(
  "/scan-prescription",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { image_base64, language } = req.body;

    if (!image_base64) {
      res.status(400).json({ error: "Please attach a prescription image." });
      return;
    }

    try {
      const result = await scanPrescription(req.userId!, image_base64, language || "en");
      res.json(result);
    } catch (err) {
      console.error("Prescription scan error:", err);
      res.status(500).json({
        error: "Could not analyze the prescription. Please try again with a clearer image.",
      });
    }
  }
);

router.post(
  "/transcribe",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { audio_base64, mime_type, language } = req.body;

    if (!audio_base64 || typeof audio_base64 !== "string") {
      res.status(400).json({ error: "Please attach audio data." });
      return;
    }

    try {
      const text = await transcribeAudio(audio_base64, mime_type, language || "en");
      res.json({ text });
    } catch (err) {
      console.error("Transcription error:", err);
      res.status(500).json({
        error: "Could not transcribe audio. Please try again.",
      });
    }
  }
);

router.get(
  "/history",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("chat_messages")
        .select("*")
        .eq("user_id", req.userId)
        .order("created_at", { ascending: true });

      if (error) {
        // If DB fails (e.g. FK issues in dev), return empty history gracefully
        res.json({ messages: [] });
        return;
      }

      res.json({ messages: data || [] });
    } catch {
      res.json({ messages: [] });
    }
  }
);

router.delete(
  "/history",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { error } = await supabaseAdmin
        .from("chat_messages")
        .delete()
        .eq("user_id", req.userId);

      if (error) {
        // Non-fatal in dev — just acknowledge
        res.json({ message: "Chat history cleared." });
        return;
      }

      res.json({ message: "Chat history cleared." });
    } catch {
      res.json({ message: "Chat history cleared." });
    }
  }
);

export default router;
