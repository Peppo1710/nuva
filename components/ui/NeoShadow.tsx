import React from "react";
import { View, type ViewStyle } from "react-native";
import { useColorScheme } from "nativewind";

interface NeoShadowProps {
  offset?: number;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const NeoShadow = React.memo(function NeoShadow({
  offset = 3,
  children,
  className = "",
  style,
}: NeoShadowProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const shadowColor = isDark ? "#A3BFDB" : "#000000";

  return (
    <View style={[{ marginBottom: offset }, style]} className={className}>
      <View
        style={{
          position: "absolute",
          left: offset,
          top: offset,
          width: "100%",
          height: "100%",
          backgroundColor: shadowColor,
          borderWidth: 2,
          borderColor: shadowColor,
        }}
      />
      {children}
    </View>
  );
});
