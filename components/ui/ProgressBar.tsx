import React from "react";
import { View } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export const ProgressBar = React.memo(function ProgressBar({
  currentStep,
  totalSteps = 3,
}: ProgressBarProps) {
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 999,
            backgroundColor: index < currentStep ? c.navy : c.border,
          }}
        />
      ))}
    </View>
  );
});
