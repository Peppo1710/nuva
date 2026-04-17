import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

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
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <View
      className={className}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: R.pill,
        borderWidth: 0.5,
        borderColor: c.border,
        backgroundColor: variant === "primary"
          ? (colorScheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(26,39,68,0.06)")
          : c.surface,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: Typography.base,
          fontWeight: "500",
          color: c.textPrimary,
        }}
      >
        {label}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={{
            marginLeft: 8,
            minWidth: 28,
            minHeight: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <Text
            style={{
              fontSize: Typography.base,
              fontWeight: "700",
              color: c.danger,
            }}
          >
            ✕
          </Text>
        </Pressable>
      )}
    </View>
  );
});
