import React, { useCallback } from "react";
import { Pressable, View, Text } from "react-native";

interface NeoToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
}

export const NeoToggle = React.memo(function NeoToggle({
  value,
  onValueChange,
  label,
  leftLabel,
  rightLabel,
  disabled = false,
}: NeoToggleProps) {
  const toggle = useCallback(() => {
    if (!disabled) onValueChange(!value);
  }, [value, disabled, onValueChange]);

  return (
    <View className="flex-row items-center">
      {label && (
        <Text className="text-[18px] font-semibold text-navy dark:text-navy-dark mr-4">
          {label}
        </Text>
      )}
      {leftLabel && (
        <Text
          className={`text-[18px] mr-3 ${
            !value
              ? "font-bold text-navy dark:text-navy-dark"
              : "text-gray-400"
          }`}
        >
          {leftLabel}
        </Text>
      )}
      <Pressable
        onPress={toggle}
        disabled={disabled}
        className={`w-[60px] h-[34px] rounded-full justify-center px-1 ${
          value ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <View
          className={`w-[26px] h-[26px] bg-white rounded-full shadow-sm ${
            value ? "self-end" : "self-start"
          }`}
        />
      </Pressable>
      {rightLabel && (
        <Text
          className={`text-[18px] ml-3 ${
            value
              ? "font-bold text-navy dark:text-navy-dark"
              : "text-gray-400"
          }`}
        >
          {rightLabel}
        </Text>
      )}
    </View>
  );
});
