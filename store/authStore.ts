import { create } from "zustand";
import { DEV_BYPASS_AUTH } from "@/lib/devConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isDevSession: boolean;

  initialize: () => Promise<void>;
  signInWithOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (
    phone: string,
    token: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

function phoneToUUID(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-12).padStart(12, "0");
  return `00000000-0000-4000-a000-${digits}`;
}

function createMockSession(phone: string): {
  session: Session;
  user: User;
} {
  const mockUser = {
    id: phoneToUUID(phone),
    aud: "authenticated",
    role: "authenticated",
    email: "",
    phone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: { provider: "phone" },
    user_metadata: { phone },
    identities: [],
    factors: [],
  } as unknown as User;

  const mockSession = {
    access_token: "dev-access-token",
    refresh_token: "dev-refresh-token",
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    token_type: "bearer",
    user: mockUser,
  } as unknown as Session;

  return { session: mockSession, user: mockUser };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,
  isDevSession: false,

  initialize: async () => {
    try {
      const savedSession = await AsyncStorage.getItem("fake_session");
      if (savedSession) {
        const { session, user } = JSON.parse(savedSession);
        set({ session, user, initialized: true, isDevSession: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },

  signInWithOtp: async (_phone: string) => {
    set({ loading: true });
    set({ loading: false });
    return { error: null };
  },

  verifyOtp: async (phone: string, _token: string) => {
    set({ loading: true });
    const { session, user } = createMockSession(phone);
    await AsyncStorage.setItem(
      "fake_session",
      JSON.stringify({ session, user })
    );
    set({ session, user, loading: false, isDevSession: true });
    return { error: null };
  },

  signOut: async () => {
    set({ loading: true });
    await AsyncStorage.removeItem("fake_session");
    await AsyncStorage.removeItem("dev_onboarding_complete");
    await AsyncStorage.removeItem("dev_profile");
    set({ session: null, user: null, loading: false, isDevSession: false });
  },

  setSession: (session: Session | null) => {
    set({ session, user: session?.user ?? null });
  },
}));
