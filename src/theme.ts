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
  components: {
    Card: {
      defaultProps: { withBorder: true, radius: "lg" },
      styles: {
        root: {
          borderWidth: rem(2),
          borderColor: "var(--border-color)",
        },
      },
    },
    Paper: { styles: { root: { borderWidth: rem(2) } } },
    Textarea: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        input: {
          borderWidth: rem(2),
          border: "2px solid var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: {
          color: "var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
      },
    },
    DatePickerInput: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        input: {
          borderWidth: rem(2),
          border: "2px solid var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
      },
    },
    TextInput: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        input: {
          borderWidth: rem(2),
          border: "2px solid var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: {
          color: "var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        description: {
          fontSize: "var(--mantine-font-size-xs)",
        },
      },
    },
    PasswordInput: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        input: {
          borderWidth: rem(2),
          border: "2px solid var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: {
          color: "var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },

        description: {
          fontSize: "var(--mantine-font-size-xs)",
        },
      },
    },
    NumberInput: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        input: {
          borderWidth: rem(2),
          border: "2px solid var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: {
          color: "var(--border-color)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        description: {
          fontSize: "var(--mantine-font-size-xs)",
        },
      },
    },
    Select: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        input: { borderWidth: rem(2), border: "2px solid var(--border-color)" },
      },
    },
    Badge: {
      defaultProps: { radius: "xl", variant: "light" },
      styles: {
        root: { borderWidth: rem(2), borderStyle: "solid", fontWeight: 800 },
      },
    },
    Divider: {
      defaultProps: { size: "sm" },
    },
    Switch: { defaultProps: { color: "lavender" } },
    Tabs: { defaultProps: { color: "lavender" } },
    Modal: {
      defaultProps: { radius: "lg", centered: true },
      styles: {
        content: {
          borderWidth: rem(2),
          borderStyle: "solid",
          borderColor: "var(--border-color)",
        },
      },
    },
  },
});
