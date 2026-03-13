import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const [checking, setChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (session) {
        const result = await useProfileStore
          .getState()
          .checkOnboardingStatus();
        setIsOnboarded(result);
      }
      setChecking(false);
    };
    check();
  }, [session]);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-background-dark">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mt-4">Loading...</Text>
      </View>
    );
  }

  if (session && isOnboarded) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (session && !isOnboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/onboarding/phone" />;
}
