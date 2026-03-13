import React from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";
import { forwardRef } from "react";

interface NeoInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const NeoInput = React.memo(
  forwardRef<TextInput, NeoInputProps>(
    (
      { label, error, containerClassName = "", className = "", ...props },
      ref
    ) => {
      return (
        <View className={`w-full ${containerClassName}`}>
          {label && (
            <Text className="text-[18px] font-semibold text-navy dark:text-navy-dark mb-2">
              {label}
            </Text>
          )}
          <View>
            <TextInput
              ref={ref}
              className={`
                min-h-[56px] w-full px-4
                rounded-xl border-[1px]
                ${error ? "border-error bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark"}
                text-[18px] text-navy dark:text-navy-dark
                ${className}
              `}
              placeholderTextColor="#9CA3AF"
              {...props}
            />
          </View>
          {error && (
            <Text className="text-[16px] text-error mt-1 font-medium">
              {error}
            </Text>
          )}
        </View>
      );
    }
  )
);

NeoInput.displayName = "NeoInput";
