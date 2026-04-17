import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "@/store/profileStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

export default function NameScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;
  const t = useT();
  const { username, setProfile } = useProfileStore();
  const [name, setName] = useState(username || "");
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t("common.error"));
      return;
    }
    setError(null);
    setProfile({ username: trimmed });
    router.push("/onboarding/age");
  };

  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              alignSelf: "flex-start",
              marginBottom: 24,
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "#1E1E1E" : c.border,
              backgroundColor: isDark ? "#111111" : c.surface,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "rgba(255,255,255,0.7)" : c.textPrimary} />
          </Pressable>

          <ProgressBar currentStep={1} totalSteps={3} />

          <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
            {t("onboarding.nameTitle")}
          </Text>

          <NeoInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            placeholder={t("onboarding.namePlaceholder")}
            autoFocus
            maxLength={100}
            style={{ minHeight: 64, fontSize: 22 }}
            error={error ?? undefined}
          />

          <View style={{ flex: 1 }} />

          <NeoButton
            title={t("common.continue")}
            onPress={handleContinue}
            disabled={name.trim().length < 2}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
