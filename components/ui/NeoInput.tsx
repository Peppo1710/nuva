import React, { useState, useCallback } from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";
import { forwardRef } from "react";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { Typography, R } from "@/constants/typography";

interface NeoInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const NeoInput = React.memo(
  forwardRef<TextInput, NeoInputProps>(
    (
      { label, error, containerClassName = "", className = "", style, ...props },
      ref
    ) => {
      const { colorScheme } = useColorScheme();
      const isDark = colorScheme === "dark";
      const c = isDark ? Colors.dark : Colors.light;
      const [focused, setFocused] = useState(false);

      const handleFocus = useCallback(
        (e: any) => {
          setFocused(true);
          props.onFocus?.(e);
        },
        [props.onFocus]
      );

      const handleBlur = useCallback(
        (e: any) => {
          setFocused(false);
          props.onBlur?.(e);
        },
        [props.onBlur]
      );

      const borderColor = error
        ? c.danger
        : focused
          ? isDark ? "#3DD6A3" : c.navy
          : isDark ? "#1E1E1E" : c.border;

      const borderWidth = focused && !error ? 1.5 : 1;

      return (
        <View className={containerClassName} style={{ width: "100%" }}>
          {label && (
            <Text
              style={{
                fontSize: Typography.sm,
                fontWeight: "600",
                color: isDark ? "rgba(255,255,255,0.6)" : c.textSecondary,
                marginBottom: 8,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}
            >
              {label}
            </Text>
          )}
          <View
            style={{
              shadowColor: focused ? (isDark ? "#3DD6A3" : c.navy) : "transparent",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: focused ? 0.2 : 0,
              shadowRadius: 8,
            }}
          >
            <TextInput
              ref={ref}
              className={className}
              style={[
                {
                  minHeight: 56,
                  width: "100%",
                  paddingHorizontal: 16,
                  borderRadius: R.lg,
                  borderWidth,
                  borderColor,
                  backgroundColor: isDark ? "#0D0D0D" : c.surface,
                  fontSize: Typography.base,
                  color: c.textPrimary,
                },
                style,
              ]}
              placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : c.textMuted}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
          </View>
          {error && (
            <Text
              style={{
                fontSize: Typography.sm,
                color: c.danger,
                marginTop: 6,
                fontWeight: "500",
              }}
            >
              {error}
            </Text>
          )}
        </View>
      );
    }
  )
);

NeoInput.displayName = "NeoInput";
