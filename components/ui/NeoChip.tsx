import React from "react";
import { Pressable, Text, View } from "react-native";

interface NeoChipProps {
  label: string;
  onRemove?: () => void;
  variant?: "default" | "primary";
  className?: string;
}

export const NeoChip = React.memo(function NeoChip({
  label,
  onRemove,
  variant = "default",
  className = "",
}: NeoChipProps) {
  const bgColor =
    variant === "primary"
      ? "bg-primary/10 dark:bg-primary/20"
      : "bg-surface dark:bg-surface-dark";

  return (
    <View
      className={`flex-row items-center px-4 py-2 rounded-full border-[1px] border-gray-200 dark:border-gray-700 mr-2 mb-2 ${bgColor} ${className}`}
    >
      <Text className="text-[18px] font-medium text-navy dark:text-navy-dark">
        {label}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          className="ml-2 min-w-[32px] min-h-[32px] items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-[18px] font-bold text-error">✕</Text>
        </Pressable>
      )}
    </View>
  );
});
