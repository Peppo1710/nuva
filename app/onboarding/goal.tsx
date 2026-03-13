import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useProfileStore } from "@/store/profileStore";
import { NeoButton } from "@/components/ui/NeoButton";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
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

        <ProgressBar currentStep={3} totalSteps={3} />

        <Text className="text-[28px] font-bold text-navy dark:text-navy-dark mb-3">
          What brings you here?
        </Text>
        <Text className="text-[18px] text-gray-500 dark:text-gray-400 mb-8">
          Pick the option that best describes your needs.
        </Text>

        <View className="gap-4">
          {GOALS.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <Pressable
                key={goal.id}
                onPress={() => setSelected(goal.id)}
                className={`min-h-[80px] p-5 rounded-2xl border-[1px] shadow-sm mb-4 ${
                  isSelected
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark"
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-[36px] mr-4">{goal.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`text-[20px] font-bold mb-1 ${
                        isSelected
                          ? "text-primary dark:text-primary-dark"
                          : "text-navy dark:text-navy-dark"
                      }`}
                    >
                      {goal.title}
                    </Text>
                    <Text className="text-[18px] text-gray-500 dark:text-gray-400">
                      {goal.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-[28px] h-[28px] bg-primary rounded-full items-center justify-center ml-2">
                      <Text className="text-white text-[16px] font-bold">✓</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {error && (
          <Text className="text-[18px] text-error font-medium text-center mt-6">
            {error}
          </Text>
        )}

        <View className="flex-1" />

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
