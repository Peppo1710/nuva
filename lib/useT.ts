import { useCallback } from "react";
import { useProfileStore } from "@/store/profileStore";
import { i18n } from "@/lib/i18n";

export function useT() {
  const lang = useProfileStore((s) => s.language);
  return useCallback(
    (key: string, options?: Record<string, unknown>) => {
      if (i18n.locale !== lang) i18n.locale = lang;
      return i18n.t(key, options);
    },
    [lang]
  );
}
