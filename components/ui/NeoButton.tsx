import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "accent" | "outline";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const NeoButton = React.memo(function NeoButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: NeoButtonProps) {
  const bgColor = {
    primary: "bg-primary",
    accent: "bg-accent",
    outline: "bg-transparent border-[1.5px] border-primary dark:border-primary-dark",
  }[variant];

  const textColor = {
    primary: "text-white",
    accent: "text-white",
    outline: "text-primary dark:text-primary-dark",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        min-h-[56px] w-full items-center justify-center rounded-xl
        ${bgColor}
        ${className}
      `}
      style={({ pressed }) => ({
        opacity: pressed || disabled ? 0.7 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#0F766E" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <Text className={`text-[18px] font-bold ${textColor}`}>{title}</Text>
      )}
    </Pressable>
  );
});
