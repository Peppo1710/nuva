import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { NeoButton } from "@/components/ui/NeoButton";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";
import { useT } from "@/lib/useT";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Background decorative elements */}
      <View style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: "rgba(61,214,163,0.06)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 100,
            right: 30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(61,214,163,0.04)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 80,
            left: -50,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: "rgba(165,148,249,0.06)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 180,
            right: 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(165,148,249,0.04)",
          }}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: "center" }}>
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 56 }}>
          <View
            style={{
              marginBottom: 32,
              shadowColor: "#3DD6A3",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 16,
            }}
          >
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 30,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#1A1A2E", "#0D0D1A"]}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(61,214,163,0.2)",
                  borderRadius: 30,
                }}
              >
                {/* Decorative inner ring */}
                <View
                  style={{
                    position: "absolute",
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 1,
                    borderColor: "rgba(61,214,163,0.15)",
                  }}
                />
                <Text style={{ fontSize: 52 }}>💊</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Gradient text effect via tint */}
          <Text
            style={{
              fontSize: Typography.xxl + 4,
              fontWeight: "700",
              color: "#FFFFFF",
              marginBottom: 8,
              letterSpacing: -1,
            }}
          >
            {t("onboarding.appName")}
          </Text>

          {/* Gradient accent line under title */}
          <View style={{ width: 48, height: 3, borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
            <LinearGradient
              colors={["#3DD6A3", "#A594F9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </View>

          <Text
            style={{
              fontSize: Typography.md,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              lineHeight: 28,
              maxWidth: 280,
            }}
          >
            {t("onboarding.tagline")}
          </Text>
        </View>

        {/* Feature pills */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 48 }}>
          {[
            { icon: "💊", label: "Med Reminders" },
            { icon: "✦", label: "AI Assistant" },
            { icon: "📋", label: "Health Records" },
            { icon: "🔔", label: "Smart Alerts" },
          ].map((feature) => (
            <View
              key={feature.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ fontSize: 13, marginRight: 6 }}>{feature.icon}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)" }}>
                {feature.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 4 }}>
          <NeoButton
            title={t("onboarding.getStarted")}
            onPress={() => router.push("/onboarding/name")}
          />
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
            textAlign: "center",
            marginTop: 20,
            fontWeight: "500",
          }}
        >
          Free · No credit card required
        </Text>
      </View>
    </SafeAreaView>
  );
}
