/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#7c3aed";
const tintColorDark = "#a78bfa";
const primaryPurple = "#7c3aed";
const darkPurple = "#5b21b6";
const lightPurple = "#a78bfa";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#f9fafb",
    tint: primaryPurple,
    icon: "#6b7280",
    tabIconDefault: "#9ca3af",
    tabIconSelected: primaryPurple,
    primary: primaryPurple,
    dark: darkPurple,
    light: lightPurple,
  },
  dark: {
    text: "#ECEDEE",
    background: "#111827",
    tint: lightPurple,
    icon: "#9BA1A6",
    tabIconDefault: "#6b7280",
    tabIconSelected: lightPurple,
    primary: primaryPurple,
    dark: darkPurple,
    light: lightPurple,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
