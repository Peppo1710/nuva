import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { DEV_BYPASS_AUTH } from "@/lib/devConfig";
import { useAuthStore } from "./authStore";
import api from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppLanguage } from "@/lib/i18n";

export interface UserProfile {
  id?: string;
  phone?: string;
  username: string | null;
  age: number | null;
  primaryGoal: string | null;
  gender: string | null;
  blood_group: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  city: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  theme_preference: string;
  avatar_url: string | null;
  language: AppLanguage;
}

interface ProfileState extends UserProfile {
  onboardingComplete: boolean;
  loading: boolean;
  saving: boolean;

  setProfile: (data: Partial<UserProfile>) => void;
  fetchProfile: () => Promise<void>;
  saveProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  saveOnboardingData: () => Promise<{ error: string | null }>;
  checkOnboardingStatus: () => Promise<boolean>;
  setTheme: (theme: string) => Promise<void>;
  setLanguage: (lang: AppLanguage, options?: { persist?: boolean }) => Promise<void>;
  reset: () => void;
}

const defaultProfile: UserProfile = {
  username: null,
  age: null,
  primaryGoal: null,
  gender: null,
  blood_group: null,
  weight_kg: null,
  height_cm: null,
  city: null,
  emergency_contact_name: null,
  emergency_contact_phone: null,
  theme_preference: "light",
  avatar_url: null,
  language: "en",
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...defaultProfile,
  onboardingComplete: false,
  loading: false,
  saving: false,

  setProfile: (data) => {
    set((state) => ({ ...state, ...data }));
  },

  fetchProfile: async () => {
    set({ loading: true });

    const authState = useAuthStore.getState();
    if (DEV_BYPASS_AUTH && authState.isDevSession) {
      const saved = await AsyncStorage.getItem("dev_profile");
      if (saved) {
        const p = JSON.parse(saved);
        set({
          id: authState.user?.id,
          phone: authState.user?.phone,
          username: p.username,
          age: p.age,
          primaryGoal: p.primaryGoal,
          onboardingComplete: !!p.username,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
      return;
    }

    try {
      const { data } = await api.get("/user/profile");
      const profile = data.profile;
      if (profile) {
        set({
          id: profile.id,
          phone: profile.phone,
          username: profile.username,
          age: profile.age,
          primaryGoal: profile.primary_goal,
          gender: profile.gender,
          blood_group: profile.blood_group,
          weight_kg: profile.weight_kg,
          height_cm: profile.height_cm,
          city: profile.city,
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
          theme_preference: profile.theme_preference || "light",
          avatar_url: profile.avatar_url,
          language: (profile.language as AppLanguage) || "en",
          onboardingComplete: !!profile.username,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  saveProfile: async (data) => {
    set({ saving: true });
    try {
      const payload: Record<string, unknown> = {};
      if (data.username !== undefined) payload.username = data.username;
      if (data.age !== undefined) payload.age = data.age;
      if (data.gender !== undefined) payload.gender = data.gender;
      if (data.blood_group !== undefined) payload.blood_group = data.blood_group;
      if (data.weight_kg !== undefined) payload.weight_kg = data.weight_kg;
      if (data.height_cm !== undefined) payload.height_cm = data.height_cm;
      if (data.city !== undefined) payload.city = data.city;
      if (data.emergency_contact_name !== undefined)
        payload.emergency_contact_name = data.emergency_contact_name;
      if (data.emergency_contact_phone !== undefined)
        payload.emergency_contact_phone = data.emergency_contact_phone;
      if (data.theme_preference !== undefined)
        payload.theme_preference = data.theme_preference;
      if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url;
      if (data.language !== undefined) payload.language = data.language;

      const { data: responseData } = await api.put("/user/profile", payload);
      const profile = responseData.profile;

      set({
        username: profile.username,
        age: profile.age,
        gender: profile.gender,
        blood_group: profile.blood_group,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        city: profile.city,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        theme_preference: profile.theme_preference || "light",
        avatar_url: profile.avatar_url,
        language: (profile.language as AppLanguage) || get().language || "en",
        saving: false,
      });
      return { error: null };
    } catch {
      set({ saving: false });
      return { error: "Could not save changes. Please try again." };
    }
  },

  saveOnboardingData: async () => {
    const { username, age, primaryGoal } = get();
    set({ loading: true });

    const authState = useAuthStore.getState();
    if (DEV_BYPASS_AUTH && authState.isDevSession) {
      await AsyncStorage.setItem("dev_onboarding_complete", "true");
      await AsyncStorage.setItem(
        "dev_profile",
        JSON.stringify({ username, age, primaryGoal })
      );
      set({ onboardingComplete: true, loading: false });
      return { error: null };
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ loading: false });
        return { error: "Not authenticated. Please sign in again." };
      }

      const { error } = await supabase.from("users").upsert(
        {
          id: user.id,
          phone: user.phone,
          username,
          age,
          primary_goal: primaryGoal,
          theme_preference: "light",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        set({ loading: false });
        return { error: "Could not save your information. Please try again." };
      }

      set({ onboardingComplete: true, loading: false });
      return { error: null };
    } catch {
      set({ loading: false });
      return { error: "Something went wrong. Please try again." };
    }
  },

  checkOnboardingStatus: async () => {
    const authState = useAuthStore.getState();
    if (DEV_BYPASS_AUTH && authState.isDevSession) {
      const saved = await AsyncStorage.getItem("dev_onboarding_complete");
      if (saved === "true") {
        set({ onboardingComplete: true });
        return true;
      }
      set({ onboardingComplete: false });
      return false;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error || !data?.username) {
        set({ onboardingComplete: false });
        return false;
      }

      set({ onboardingComplete: true });
      return true;
    } catch {
      set({ onboardingComplete: false });
      return false;
    }
  },

  setTheme: async (theme: string) => {
    set({ theme_preference: theme });
    await AsyncStorage.setItem("theme_preference", theme);
    try {
      await api.put("/user/profile", { theme_preference: theme });
    } catch {
      // Theme is saved locally even if remote save fails
    }
  },

  setLanguage: async (lang, options) => {
    set({ language: lang });
    const persist = options?.persist !== false;
    if (!persist) return;
    try {
      await AsyncStorage.setItem("app_language", lang);
    } catch {}
    try {
      await api.put("/user/profile", { language: lang });
    } catch {
      // Language is saved locally even if remote save fails
    }
  },

  reset: () => {
    set({
      ...defaultProfile,
      onboardingComplete: false,
      loading: false,
      saving: false,
    });
  },
}));
