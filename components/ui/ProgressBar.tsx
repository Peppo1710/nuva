import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 32 }}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: isDark ? "#1A1A1A" : c.border,
          }}
        >
          {index < currentStep && (
            <LinearGradient
              colors={["#3DD6A3", "#A594F9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          )}
        </View>
      ))}
    </View>
  );
});
