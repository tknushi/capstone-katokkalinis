/**
 * Katok Kalinis Brand Theme & Design System Tokens
 * Cagayan de Oro City Municipal Waste Management & Market Hygiene System
 */

import { Platform } from "react-native";

export const BrandColors = {
  primary: "#2E7D32",
  primaryDark: "#1E331B",
  primaryLight: "#4CAF50",
  surfaceLight: "#E8F8EE",
  background: "#FBFDFB",
  backgroundWhite: "#FFFFFF",
  border: "#E2ECE0",
  borderLight: "#EEF5ED",
  textPrimary: "#1E331B",
  textSecondary: "#5C7858",
  textMuted: "#839880",

  // Feedback states
  success: "#2E7D32",
  successLight: "#E8F8EE",
  warning: "#E65100",
  warningLight: "#FFF3E0",
  danger: "#C62828",
  dangerLight: "#FFEBEE",
  info: "#1976D2",
  infoLight: "#E3F2FD",
};

const tintColorLight = BrandColors.primary;
const tintColorDark = "#81C784";

export const Colors = {
  light: {
    text: BrandColors.textPrimary,
    background: BrandColors.background,
    tint: tintColorLight,
    icon: BrandColors.textSecondary,
    tabIconDefault: "#7A8D78",
    tabIconSelected: tintColorLight,
    surface: BrandColors.surfaceLight,
    card: BrandColors.backgroundWhite,
    border: BrandColors.border,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151B15",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#7A8D78",
    tabIconSelected: tintColorDark,
    surface: "#1E2A1E",
    card: "#1C241C",
    border: "#2A3A2A",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
