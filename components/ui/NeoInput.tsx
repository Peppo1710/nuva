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
      const c = colorScheme === "dark" ? Colors.dark : Colors.light;
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
          ? c.navy
          : c.border;
      const borderWidth = focused && !error ? 1.5 : 1;

      return (
        <View className={containerClassName} style={{ width: "100%" }}>
          {label && (
            <Text
              style={{
                fontSize: Typography.base,
                fontWeight: "600",
                color: c.textPrimary,
                marginBottom: 8,
              }}
            >
              {label}
            </Text>
          )}
          <View>
            <TextInput
              ref={ref}
              className={className}
              style={[
                {
                  minHeight: 56,
                  width: "100%",
                  paddingHorizontal: 16,
                  borderRadius: R.md,
                  borderWidth,
                  borderColor,
                  backgroundColor: c.surface,
                  fontSize: Typography.base,
                  color: c.textPrimary,
                },
                style,
              ]}
              placeholderTextColor={c.textMuted}
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
                marginTop: 4,
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
