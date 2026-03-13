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
import { useProfileStore } from "@/store/profileStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function NameScreen() {
  const router = useRouter();
  const { username, setProfile } = useProfileStore();
  const [name, setName] = useState(username || "");
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter at least 2 characters");
      return;
    }
    setError(null);
    setProfile({ username: trimmed });
    router.push("/onboarding/age");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6 pb-8">
          <Pressable
            onPress={() => router.back()}
            className="self-start mb-6 min-w-[56px] min-h-[56px] items-center justify-center
              rounded-xl border-[1px] border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-surface-dark shadow-sm"
          >
            <Text className="text-[18px] font-bold text-navy dark:text-navy-dark">
              ← Back
            </Text>
          </Pressable>

          <ProgressBar currentStep={1} totalSteps={3} />

          <Text className="text-[28px] font-bold text-navy dark:text-navy-dark mb-3">
            What should we call you?
          </Text>
          <Text className="text-[18px] text-gray-500 dark:text-gray-400 mb-8">
            This is how we'll greet you in the app.
          </Text>

          <NeoInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            placeholder="Your Name"
            autoFocus
            maxLength={100}
            className="min-h-[64px] text-[22px]"
            error={error ?? undefined}
          />

          <View className="flex-1" />

          <NeoButton
            title="Continue"
            onPress={handleContinue}
            disabled={name.trim().length < 2}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
