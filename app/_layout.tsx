import "../global.css";
import { useEffect, useState, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
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
    setColorScheme("dark");

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

function AnimatedSplash() {
  const pulse = useRef(new Animated.Value(0.6)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(ring1, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(ring2, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0F172A",
        zIndex: 100,
      }}
    >
      <View style={{ width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: 80,
            borderWidth: 1.5,
            borderColor: "rgba(61,214,163,0.3)",
            opacity: ring1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [{ scale: ring1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.8] }) }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: 80,
            borderWidth: 1.5,
            borderColor: "rgba(83,74,183,0.3)",
            opacity: ring2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [{ scale: ring2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.8] }) }],
          }}
        />
        <Animated.View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: "#1D9E75",
            alignItems: "center",
            justifyContent: "center",
            opacity: pulse,
            transform: [{ scale: pulse.interpolate({ inputRange: [0.6, 1], outputRange: [0.92, 1] }) }],
          }}
        >
          <Text style={{ fontSize: 40 }}>💊</Text>
        </Animated.View>
      </View>
      <Animated.View style={{ opacity: fadeIn, alignItems: "center", marginTop: 32 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#FFFFFF",
            letterSpacing: 2,
          }}
        >
          Nuva
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            marginTop: 8,
            letterSpacing: 0.5,
          }}
        >
          Your health companion
        </Text>
      </Animated.View>
    </View>
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
      {(!initialized || !isReady) && <AnimatedSplash />}
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
