import React from "react";
import { View, type ViewProps } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { R, S } from "@/constants/typography";

interface NeoCardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  shadowOffset?: number;
}

export const NeoCard = React.memo(function NeoCard({
  children,
  className = "",
  style,
  ...props
}: NeoCardProps) {
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: c.surface,
          borderWidth: 0.5,
          borderColor: c.border,
          borderRadius: R.lg,
          padding: S.base,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});
