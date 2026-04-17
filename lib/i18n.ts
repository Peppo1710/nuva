import { I18n } from "i18n-js";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import mr from "@/locales/mr.json";

export type AppLanguage = "en" | "hi" | "mr";

export const LANGUAGE_OPTIONS: { code: AppLanguage; label: string; englishName: string }[] = [
  { code: "en", label: "English", englishName: "English" },
  { code: "hi", label: "हिंदी", englishName: "Hindi" },
  { code: "mr", label: "मराठी", englishName: "Marathi" },
];

export const LANGUAGE_PROMPT_NAME: Record<AppLanguage, string> = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  mr: "Marathi (Devanagari script)",
};

export const i18n = new I18n({ en, hi, mr });
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = "en";

export function setI18nLocale(lang: AppLanguage) {
  i18n.locale = lang;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
