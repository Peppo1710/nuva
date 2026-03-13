import { View, Text } from "react-native";
import { useUIStore } from "@/store/uiStore";

export function NetworkBanner() {
  const isOffline = useUIStore((s) => s.isOffline);

  if (!isOffline) return null;

  return (
    <View className="bg-error px-4 py-3 flex-row items-center justify-center">
      <Text className="text-[18px] font-bold text-white text-center">
        No internet connection
      </Text>
    </View>
  );
}
