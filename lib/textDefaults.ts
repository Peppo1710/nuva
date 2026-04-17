import React from "react";
import { Text, TextInput, StyleSheet } from "react-native";
import { Fonts, fontForWeight } from "@/constants/typography";

type MutableComponent = {
  render?: (...args: unknown[]) => unknown;
  defaultProps?: Record<string, unknown>;
};

function patch(component: MutableComponent) {
  const originalRender = component.render;
  if (originalRender) {
    component.render = function patched(...args: unknown[]) {
      const el = originalRender.apply(this, args) as React.ReactElement | null;
      if (!el || typeof el !== "object") return el;
      const props = (el.props || {}) as Record<string, unknown>;
      const flat = StyleSheet.flatten(props.style as unknown) || {};
      const weight = (flat as Record<string, unknown>).fontWeight as string | number | undefined;
      const family = fontForWeight(weight);
      const alreadyHasFamily = !!(flat as Record<string, unknown>).fontFamily;
      const nextStyle = alreadyHasFamily ? props.style : [{ fontFamily: family }, props.style];
      return React.cloneElement(el, { ...props, style: nextStyle });
    };
  } else {
    component.defaultProps = component.defaultProps || {};
    component.defaultProps.style = [
      { fontFamily: Fonts.regular },
      (component.defaultProps as { style?: unknown }).style,
    ];
  }
}

patch(Text as unknown as MutableComponent);
patch(TextInput as unknown as MutableComponent);
