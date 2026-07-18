import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MantineColorScheme } from "@mantine/core";

interface UiState {
  colorScheme: MantineColorScheme; // 'light' | 'dark' | 'auto' (wired in 0.3.0)
  navOpen: boolean;
  setColorScheme: (s: MantineColorScheme) => void;
  toggleNav: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      colorScheme: "auto",
      navOpen: false,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
    }),
    { name: "zula-ui" },
  ),
);
