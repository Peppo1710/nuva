import React from "react";
import { View } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export const ProgressBar = React.memo(function ProgressBar({
  currentStep,
  totalSteps = 3,
}: ProgressBarProps) {
  return (
    <View className="flex-row gap-3 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`flex-1 h-[8px] rounded-full ${
            index < currentStep
              ? "bg-primary"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </View>
  );
});
