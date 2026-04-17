export const Typography = {
  xs:   12,
  sm:   14,
  base: 16,
  md:   18,
  lg:   22,
  xl:   28,
  xxl:  34,
} as const;

export const Fonts = {
  regular:   "Inter_400Regular",
  medium:    "Inter_500Medium",
  semibold:  "Inter_600SemiBold",
  bold:      "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
} as const;

export const fontForWeight = (weight?: string | number): string => {
  const w = typeof weight === "number" ? String(weight) : weight;
  switch (w) {
    case "800":
    case "900":
    case "extrabold":
    case "black":
      return Fonts.extrabold;
    case "700":
    case "bold":
      return Fonts.bold;
    case "600":
    case "semibold":
      return Fonts.semibold;
    case "500":
    case "medium":
      return Fonts.medium;
    default:
      return Fonts.regular;
  }
};

export const S = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24 } as const;
export const R = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
