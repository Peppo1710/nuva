import { useEffect, useState, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

const SPLASH_DURATION_MS = 3000;

function PulsingRings({ color }: { color: string }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    <>
      <Animated.View
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: 100,
          borderWidth: 1.5,
          borderColor: color,
          opacity: ring1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
          transform: [{ scale: ring1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2] }) }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: 100,
          borderWidth: 1.5,
          borderColor: color,
          opacity: ring2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
          transform: [{ scale: ring2.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2] }) }],
        }}
      />
    </>
  );
}

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconPulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        stiffness: 100,
        damping: 12,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const check = async () => {
      if (session) {
        const result = await useProfileStore
          .getState()
          .checkOnboardingStatus();
        setIsOnboarded(result);
      }
      setAuthChecked(true);
    };
    check();
  }, [session, initialized]);

  useEffect(() => {
    if (!authChecked) return;
    const timer = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [authChecked]);

  useEffect(() => {
    if (!splashDone || !authChecked) return;

    if (session && isOnboarded) {
      router.replace("/(tabs)/home");
    } else if (session && !isOnboarded) {
      router.replace("/onboarding/welcome");
    } else {
      router.replace("/onboarding/phone");
    }
  }, [splashDone, authChecked]);

  const isAuthenticated = authChecked && !!session;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0F172A",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View style={{ width: 200, height: 200, alignItems: "center", justifyContent: "center" }}>
          <PulsingRings
            color={isAuthenticated ? "rgba(61,214,163,0.35)" : "rgba(83,74,183,0.35)"}
          />
          <Animated.View
            style={{
              width: 90,
              height: 90,
              borderRadius: 28,
              backgroundColor: isAuthenticated ? "#1D9E75" : "#534AB7",
              alignItems: "center",
              justifyContent: "center",
              opacity: iconPulse,
              transform: [
                { scale: iconPulse.interpolate({ inputRange: [0.7, 1], outputRange: [0.9, 1.05] }) },
              ],
            }}
          >
            <Text style={{ fontSize: 44 }}>{isAuthenticated ? "👋" : "💊"}</Text>
          </Animated.View>
        </View>

        <Text
          style={{
            fontSize: 38,
            fontWeight: "800",
            color: "#FFFFFF",
            marginTop: 28,
            letterSpacing: 2,
          }}
        >
          Nuva
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.45)",
            marginTop: 10,
            letterSpacing: 0.5,
          }}
        >
          {isAuthenticated ? "Welcome back" : "Your health companion"}
        </Text>
      </Animated.View>
    </View>
  );
}
