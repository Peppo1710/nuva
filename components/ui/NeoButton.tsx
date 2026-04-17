import React, { useRef, useCallback } from "react";
import { Pressable, Text, ActivityIndicator, Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const isPrimary = variant === "primary" || variant === "accent";

  if (isPrimary) {
    return (
      <Animated.View
        className={className}
        style={{
          transform: [{ scale: scaleAnim }],
          borderRadius: R.lg,
          overflow: "hidden",
          shadowColor: isDark ? "#3DD6A3" : "#1D9E75",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: disabled ? 0 : 0.25,
          shadowRadius: 12,
          elevation: disabled ? 0 : 6,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={{ borderRadius: R.lg, overflow: "hidden" }}
        >
          <LinearGradient
            colors={isDark ? ["#3DD6A3", "#A594F9"] : ["#1D9E75", "#534AB7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              minHeight: 56,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={{
                  fontSize: Typography.base,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  letterSpacing: 0.3,
                }}
              >
                {title}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      className={className}
      style={{ transform: [{ scale: scaleAnim }], opacity: disabled ? 0.5 : 1 }}
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
          borderRadius: R.lg,
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: isDark ? "rgba(61,214,163,0.4)" : c.navy,
        }}
      >
        {loading ? (
          <ActivityIndicator color={isDark ? c.teal : c.navy} size="small" />
        ) : (
          <Text
            style={{
              fontSize: Typography.base,
              fontWeight: "700",
              color: isDark ? c.teal : c.navy,
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
});
