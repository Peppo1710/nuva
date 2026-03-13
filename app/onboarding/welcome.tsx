import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { NeoButton } from "@/components/ui/NeoButton";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-1 px-6 justify-center items-center">
        <View className="items-center mb-16">
          <View className="mb-8 w-[120px] h-[120px] bg-primary items-center justify-center rounded-[36px] shadow-soft border-[1px] border-gray-100 dark:border-gray-800">
            <Text className="text-[56px]">💊</Text>
          </View>

          <Text className="text-[36px] font-bold text-navy dark:text-navy-dark mb-3">
            MediAssist
          </Text>

          <Text className="text-[20px] text-gray-500 dark:text-gray-400 text-center leading-[28px]">
            Your AI-powered medication{"\n"}& health companion
          </Text>
        </View>

        <View className="w-full px-2">
          <NeoButton
            title="Get Started"
            onPress={() => router.push("/onboarding/name")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
