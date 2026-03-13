import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="phone" options={{ gestureEnabled: false }} />
      <Stack.Screen name="verify" />
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="name" />
      <Stack.Screen name="age" />
      <Stack.Screen name="goal" />
    </Stack>
  );
}
