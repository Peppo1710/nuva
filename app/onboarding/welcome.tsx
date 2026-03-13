import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { NeoButton } from "@/components/ui/NeoButton";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center", alignItems: "center" }}>
        <View style={{ alignItems: "center", marginBottom: 64 }}>
          <View
            style={{
              marginBottom: 32,
              width: 120,
              height: 120,
              backgroundColor: c.navy,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 36,
              borderWidth: 0.5,
              borderColor: c.border,
            }}
          >
            <Text style={{ fontSize: 56 }}>💊</Text>
          </View>

          <Text style={{ fontSize: Typography.xxl, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
            MediAssist
          </Text>

          <Text
            style={{
              fontSize: Typography.md,
              color: c.textSecondary,
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            Your AI-powered medication{"\n"}& health companion
          </Text>
        </View>

        <View style={{ width: "100%", paddingHorizontal: 8 }}>
          <NeoButton
            title="Get Started"
            onPress={() => router.push("/onboarding/name")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
