import "../global.css";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { playNotificationSound, cleanupSound } from "@/lib/notificationSound";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const themePreference = useProfileStore((s) => s.theme_preference);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("theme_preference");
        if (saved === "dark" || saved === "light") {
          setColorScheme(saved);
        }
      } catch {}
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (themePreference === "dark" || themePreference === "light") {
      setColorScheme(themePreference);
    }
  }, [themePreference, setColorScheme]);

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {children}
    </>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    const checkAndRoute = async () => {
      const inOnboarding = segments[0] === "onboarding";

      if (!session && !inOnboarding) {
        router.replace("/onboarding/phone");
      } else if (session) {
        const isOnboarded = await useProfileStore
          .getState()
          .checkOnboardingStatus();

        if (!isOnboarded && !inOnboarding) {
          router.replace("/onboarding/welcome");
        } else if (isOnboarded && inOnboarding) {
          router.replace("/(tabs)/home");
        }
      }

      setIsReady(true);
    };

    checkAndRoute();
  }, [session, initialized, segments]);

  return (
    <>
      {children}
      {(!initialized || !isReady) && (
        <View
          className="absolute inset-0 items-center justify-center bg-background dark:bg-background-dark"
          style={{ zIndex: 100 }}
        >
          <ActivityIndicator size="large" color="#1A2744" />
          <Text className="text-[17px] text-gray-500 dark:text-gray-400 mt-4">
            Loading...
          </Text>
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize().then(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      playNotificationSound();
    });

    return () => {
      subscription.remove();
      cleanupSound();
    };
  }, []);

  return (
    <ThemeProvider>
      <NetworkBanner />
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </ThemeProvider>
  );
}
