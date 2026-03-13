import React from "react";
import { View, type ViewProps } from "react-native";
import { useColorScheme } from "nativewind";

interface NeoCardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  shadowOffset?: number; // Kept for backwards compatibility if needed, but ignored visually
}

export const NeoCard = React.memo(function NeoCard({
  children,
  className = "",
  shadowOffset = 5,
  style,
  ...props
}: NeoCardProps) {
  return (
    <View
      className={`p-5 rounded-2xl bg-white dark:bg-surface-dark border-[1px] border-gray-100 dark:border-gray-800 shadow-soft ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
});
