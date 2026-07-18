// src/theme.ts
// Zula "Candy" theme for Mantine v7 — soft pastels, 2px borders, soft corners.
// Works with <MantineProvider theme={theme} defaultColorScheme={colorScheme}> (see AppProviders).
//
//   npm i @mantine/core @mantine/hooks
//   // load fonts once (index.html <head> or a global CSS):
//   // @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');

import { createTheme, rem, type MantineColorsTuple } from "@mantine/core";

/* ------------------------------------------------------------------ *
 * Candy palette — each brand color as a Mantine 10-shade tuple.
 * Index 6 is the "primary" shade Mantine uses by default.
 * ------------------------------------------------------------------ */
// Every brand color as a full 1→10 scale (Mantine indexes 0–9 = steps 1–10).
// Step 1 = lightest tint (surfaces/hovers) … step 10 = darkest shade (text on tint).
// The brand pastel sits mid-scale; the tonal border we use on filled controls is +2 steps.
const lavender: MantineColorsTuple = [
  "#f5f1fc", // 1  tint bg
  "#eae1f7", // 2
  "#dcccef", // 3
  "#cdb8e8", // 4
  "#b8a4e0", // 5  ← brand lavender (fill)
  "#a68fd6", // 6
  "#9a80cc", // 7  ← tonal border for lavender fills
  "#8168b0", // 8
  "#654f8c", // 9
  "#4a3d63", // 10 ink
];
const peach: MantineColorsTuple = [
  "#fdf4ee", // 1
  "#fbe7d7", // 2
  "#f9d8bf", // 3
  "#f7cfb2", // 4
  "#f6c6a4", // 5  ← brand peach (fill)
  "#efb488", // 6
  "#e2a071", // 7  ← tonal border for peach fills
  "#cf8451", // 8
  "#a5663a", // 9
  "#79482a", // 10
];
const mint: MantineColorsTuple = [
  "#eff9f4", // 1
  "#dcf1e8", // 2
  "#c6e9d8", // 3
  "#b7e3cf", // 4
  "#a8ddc9", // 5  ← brand mint (fill)
  "#8fceb6", // 6
  "#7ec4a8", // 7  ← tonal border for mint fills
  "#5aa98a", // 8
  "#40836a", // 9
  "#2c5a49", // 10
];

/* Dark-scheme surfaces (Mantine `dark` tuple: 0 = lightest text … 9 = darkest bg).
 * Tuned soft — no stark black; matches the app's #211b2e / #2c2440 surfaces. */
const candyDark: MantineColorsTuple = [
  "#f3eefb", // 0  text
  "#cabfe0", // 1
  "#a99bc2", // 2  muted
  "#8a7ba6", // 3
  "#5a4d78", // 4  borders
  "#443a5c", // 5
  "#372e4d", // 6  raised surface
  "#2c2440", // 7  surface
  "#211b2e", // 8  body bg
  "#191325", // 9  deepest
];

export const theme = createTheme({
  primaryColor: "lavender",
  primaryShade: { light: 4, dark: 4 }, // index 4 = step 5 = brand lavender
  colors: { lavender, peach, mint, dark: candyDark },

  // soft, not-stark neutrals
  white: "#ffffff",
  black: "#4a3d63",

  fontFamily: "Nunito, system-ui, sans-serif",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, monospace",
  headings: {
    fontFamily: "Poppins, Nunito, sans-serif",
    fontWeight: "600",
  },

  defaultRadius: "md",
  radius: { sm: rem(8), md: rem(11), lg: rem(14), xl: rem(18) },

  // the signature 2px borders
  components: {
    Card: {
      defaultProps: { withBorder: true, radius: "lg" },
      styles: {
        root: {
          borderWidth: rem(2),
          borderColor: "var(--mantine-color-default-border)",
        },
      },
    },
    Paper: { styles: { root: { borderWidth: rem(2) } } },
    Button: {
      defaultProps: { radius: "md" },
      styles: { root: { borderWidth: rem(2), fontWeight: 800 } },
    },
    TextInput: {
      defaultProps: { radius: "md" },
      styles: { input: { borderWidth: rem(2) } },
    },
    NumberInput: {
      defaultProps: { radius: "md" },
      styles: { input: { borderWidth: rem(2) } },
    },
    Select: {
      defaultProps: { radius: "md" },
      styles: { input: { borderWidth: rem(2) } },
    },
    Badge: {
      defaultProps: { radius: "xl", variant: "light" },
      styles: {
        root: { borderWidth: rem(2), borderStyle: "solid", fontWeight: 800 },
      },
    },
    Switch: { defaultProps: { color: "lavender" } },
    Tabs: { defaultProps: { color: "lavender" } },
    Modal: {
      defaultProps: { radius: "lg", centered: true },
      styles: {
        content: {
          borderWidth: rem(2),
          borderStyle: "solid",
          borderColor: "var(--mantine-color-default-border)",
        },
      },
    },
  },

  other: {
    // raw tokens if you need them outside Mantine components (exports, charts…)
    candy: {
      primary: "#b8a4e0",
      secondary: "#f6c6a4",
      tertiary: "#a8ddc9",
      ink: "#4a3d63",
      light: {
        bg: "#f5f2fa",
        surface: "#ffffff",
        border: "#4a3d63",
        muted: "#8a7fa0",
      },
      dark: {
        bg: "#211b2e",
        surface: "#2c2440",
        border: "#5a4d78",
        muted: "#a99bc2",
      },
    },
  },
});
