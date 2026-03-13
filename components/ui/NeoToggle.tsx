import React, { useCallback } from "react";
import { Pressable, View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

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
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;

  const toggle = useCallback(() => {
    if (!disabled) onValueChange(!value);
  }, [value, disabled, onValueChange]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {label && (
        <Text
          style={{
            fontSize: Typography.base,
            fontWeight: "600",
            color: c.textPrimary,
            marginRight: 16,
          }}
        >
          {label}
        </Text>
      )}
      {leftLabel && (
        <Text
          style={{
            fontSize: Typography.base,
            marginRight: 12,
            fontWeight: !value ? "700" : "400",
            color: !value ? c.textPrimary : c.textMuted,
          }}
        >
          {leftLabel}
        </Text>
      )}
      <Pressable
        onPress={toggle}
        disabled={disabled}
        style={{
          width: 52,
          height: 30,
          borderRadius: 999,
          justifyContent: "center",
          paddingHorizontal: 3,
          backgroundColor: value ? c.teal : c.border,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            alignSelf: value ? "flex-end" : "flex-start",
          }}
        />
      </Pressable>
      {rightLabel && (
        <Text
          style={{
            fontSize: Typography.base,
            marginLeft: 12,
            fontWeight: value ? "700" : "400",
            color: value ? c.textPrimary : c.textMuted,
          }}
        >
          {rightLabel}
        </Text>
      )}
    </View>
  );
});
