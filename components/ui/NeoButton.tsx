import React, { useRef, useCallback } from "react";
import { Pressable, Text, ActivityIndicator, Animated } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

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
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const isPrimary = variant === "primary" || variant === "accent";

  return (
    <Animated.View
      className={className}
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={{
          minHeight: 56,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: R.md,
          backgroundColor: isPrimary ? c.navy : "transparent",
          borderWidth: isPrimary ? 0 : 1.5,
          borderColor: isPrimary ? undefined : c.navy,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator
            color={isPrimary ? c.textOnNavy : c.navy}
            size="small"
          />
        ) : (
          <Text
            style={{
              fontSize: Typography.base,
              fontWeight: "600",
              color: isPrimary ? c.textOnNavy : c.navy,
            }}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
});
