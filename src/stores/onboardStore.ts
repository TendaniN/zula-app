import { create } from "zustand";

/**
 * Onboarding store — holds the reactive "has this user onboarded" flag so UI
 * (welcome modal, sidebar nudge) updates without a reload. Backed by
 * localStorage keyed per user in v1; the actions are async so swapping to a
 * profiles.onboarded_at column in v2 touches only this file.
 */

const onboardKey = (userId: string) => `zula:onboarded:${userId}`;

interface OnboardState {
  /** null = not checked yet for the current user; true/false once resolved. */
  onboarded: boolean | null;
  loading: boolean;

  /** Resolve onboarding state for a user (call after auth resolves). */
  refresh: (userId: string | null) => Promise<void>;
  /** Mark onboarding complete and update the reactive flag. */
  complete: (userId: string | null) => Promise<void>;
  clear: () => void;
}

export const useOnboardStore = create<OnboardState>((set) => ({
  onboarded: null,
  loading: false,

  refresh: async (userId) => {
    if (!userId) {
      set({ onboarded: false });
      return;
    }
    set({ loading: true });

    let onboarded;
    try {
      onboarded = localStorage.getItem(onboardKey(userId)) === "1";
    } catch {
      onboarded = false;
    }
    set({ onboarded, loading: false });
  },

  complete: async (userId) => {
    if (!userId) return;
    try {
      localStorage.setItem(onboardKey(userId), "1");
    } catch {
      // non-fatal
    }
    set({ onboarded: true });
  },

  clear: () => set({ onboarded: null, loading: false }),
}));
