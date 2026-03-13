import { create } from "zustand";
import api from "@/lib/api";

export interface DrugInfo {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
  created_at: string;
  prescription?: DrugInfo[] | null;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  scanning: boolean;

  fetchHistory: () => Promise<void>;
  sendMessage: (
    message: string,
    imageBase64?: string | null
  ) => Promise<{ error: string | null }>;
  scanPrescription: (
    imageBase64: string
  ) => Promise<{ drugs: DrugInfo[]; error: string | null }>;
  clearHistory: () => Promise<{ error: string | null }>;
  addLocalMessage: (msg: ChatMessage) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  sending: false,
  scanning: false,

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/ai/history");
      set({ messages: data.messages || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  sendMessage: async (message, imageBase64 = null) => {
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message || "[Image sent]",
      image_url: imageBase64 ? "local-preview" : null,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, tempUserMsg], sending: true }));

    try {
      const history = get()
        .messages.filter((m) => m.id !== tempUserMsg.id)
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post("/ai/chat", {
        message,
        image_base64: imageBase64,
        history,
      });

      const assistantMsg: ChatMessage = {
        id: data.message_id || `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };

      set((s) => ({ messages: [...s.messages, assistantMsg], sending: false }));
      return { error: null };
    } catch {
      set({ sending: false });
      return { error: "Our AI is having trouble right now. Please try again." };
    }
  },

  scanPrescription: async (imageBase64) => {
    set({ scanning: true });
    try {
      const { data } = await api.post("/ai/scan-prescription", {
        image_base64: imageBase64,
      });

      const drugs: DrugInfo[] = data.drugs || [];

      const scanMsg: ChatMessage = {
        id: `scan-${Date.now()}`,
        role: "assistant",
        content: data.raw_text || "Prescription analysis complete.",
        created_at: new Date().toISOString(),
        prescription: drugs.length > 0 ? drugs : null,
      };

      set((s) => ({
        messages: [...s.messages, scanMsg],
        scanning: false,
      }));

      return { drugs, error: null };
    } catch {
      set({ scanning: false });
      return {
        drugs: [],
        error: "Could not analyze the prescription. Please try with a clearer image.",
      };
    }
  },

  clearHistory: async () => {
    try {
      await api.delete("/ai/history");
      set({ messages: [] });
      return { error: null };
    } catch {
      return { error: "Could not clear chat history." };
    }
  },

  addLocalMessage: (msg) => {
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  reset: () => {
    set({ messages: [], loading: false, sending: false, scanning: false });
  },
}));
