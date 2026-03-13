import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useProfileStore } from "@/store/profileStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Colors } from "@/constants/colors";
import { Typography, R, S } from "@/constants/typography";

const GOALS = [
  {
    id: "medicines" as const,
    icon: "💊",
    title: "Remember my medicines",
    description: "Set reminders so I never miss a dose",
  },
  {
    id: "prescriptions" as const,
    icon: "📋",
    title: "Understand prescriptions",
    description: "Scan and decode doctor prescriptions",
  },
  {
    id: "both" as const,
    icon: "🏥",
    title: "Both of the above",
    description: "Full medication management and AI help",
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const { primaryGoal, setProfile, saveOnboardingData, loading } =
    useProfileStore();
  const [selected, setSelected] = useState<string | null>(primaryGoal);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!selected) return;

    setProfile({ primaryGoal: selected });
    setError(null);

    useProfileStore.setState({ primaryGoal: selected });

    const { error: saveError } = await useProfileStore
      .getState()
      .saveOnboardingData();

    if (saveError) {
      setError(saveError);
      return;
    }

    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-start",
            marginBottom: 24,
            minWidth: 56,
            minHeight: 56,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: R.md,
            borderWidth: 0.5,
            borderColor: c.border,
            paddingHorizontal: 16,
            backgroundColor: c.surface,
          }}
        >
          <Text style={{ fontSize: Typography.base, fontWeight: "700", color: c.textPrimary }}>
            ← Back
          </Text>
        </Pressable>

        <ProgressBar currentStep={3} totalSteps={3} />

        <Text style={{ fontSize: Typography.xl, fontWeight: "700", color: c.textPrimary, marginBottom: 12 }}>
          What brings you here?
        </Text>
        <Text style={{ fontSize: Typography.base, color: c.textSecondary, marginBottom: 32 }}>
          Pick the option that best describes your needs.
        </Text>

        <View style={{ gap: 16 }}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <Pressable
                key={goal.id}
                onPress={() => setSelected(goal.id)}
                style={{
                  minHeight: 80,
                  padding: S.lg,
                  borderRadius: R.lg,
                  borderWidth: isSelected ? 1.5 : 0.5,
                  borderColor: isSelected ? c.navy : c.border,
                  backgroundColor: isSelected
                    ? (isDark ? "rgba(58,81,160,0.12)" : "rgba(26,39,68,0.04)")
                    : c.surface,
                  marginBottom: 0,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 36, marginRight: 16 }}>{goal.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: Typography.md,
                        fontWeight: "700",
                        marginBottom: 4,
                        color: isSelected ? c.navy : c.textPrimary,
                      }}
                    >
                      {goal.title}
                    </Text>
                    <Text style={{ fontSize: Typography.base, color: c.textSecondary }}>
                      {goal.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: c.navy,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: Typography.sm, fontWeight: "700" }}>✓</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {error && (
          <Text style={{ fontSize: Typography.base, color: c.danger, fontWeight: "500", textAlign: "center", marginTop: 24 }}>
            {error}
          </Text>
        )}

        <View style={{ flex: 1 }} />

        <NeoButton
          title="Finish Setup"
          onPress={handleFinish}
          disabled={!selected}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
