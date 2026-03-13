import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-background-dark">
        <Text className="text-[24px] font-bold text-navy dark:text-navy-dark mb-4">
          This screen doesn't exist.
        </Text>
        <Link href="/">
          <Text className="text-[18px] text-primary underline">
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
