import React from "react";
import { View, type ViewProps } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { R, S } from "@/constants/typography";

interface NeoCardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  glow?: "teal" | "violet" | "none";
}

export const NeoCard = React.memo(function NeoCard({
  children,
  className = "",
  style,
  glow = "none",
  ...props
}: NeoCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

  const shadowColor =
    glow === "teal"
      ? "#3DD6A3"
      : glow === "violet"
      ? "#A594F9"
      : isDark ? "#000000" : "#1A2744";

  const borderColor =
    glow === "teal"
      ? isDark ? "rgba(61,214,163,0.25)" : "rgba(29,158,117,0.2)"
      : glow === "violet"
      ? isDark ? "rgba(165,148,249,0.25)" : "rgba(83,74,183,0.2)"
      : isDark ? "#1E1E1E" : c.border;

  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: isDark ? "#111111" : c.surface,
          borderWidth: 1,
          borderColor,
          borderRadius: R.xl,
          padding: S.base + 4,
          shadowColor,
          shadowOffset: { width: 0, height: glow !== "none" ? 4 : 2 },
          shadowOpacity: glow !== "none" ? 0.18 : 0.08,
          shadowRadius: glow !== "none" ? 12 : 4,
          elevation: glow !== "none" ? 5 : 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});
