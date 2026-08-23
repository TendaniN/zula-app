import {
  Switch,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { LuSun, LuMoon } from "react-icons/lu";

export const ThemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = scheme === "dark";

  return (
    <Switch
      size="xl"
      checked={isDark}
      onChange={(e) =>
        setColorScheme(e.currentTarget.checked ? "dark" : "light")
      }
      label="Dark mode"
      labelPosition="left"
      aria-label="Toggle dark mode"
      thumbIcon={
        isDark ? (
          <LuMoon color="var(--text-color)" />
        ) : (
          <LuSun color="var(--text-color)" />
        )
      }
      styles={{
        thumb: {
          backgroundColor: isDark
            ? "var(--mantine-color-dark-7)"
            : "var(--mantine-color-peach-3)",
          border: "2px solid var(--border-color)",
        },
        track: {
          backgroundColor: isDark
            ? "var(--mantine-primary-color-5)"
            : "var(--surface-color)",
          border: "2px solid var(--border-color)",
          cursor: "pointer",
        },
        label: {
          fontSize: "var(--mantine-font-size-sm)",
          fontWeight: "bold",
        },
      }}
    />
  );
};
