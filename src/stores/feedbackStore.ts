import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { FeedbackFormValues } from "@/components/nav/FeedbackModal/schema";

// App version stamped on every row so a report from 0.4.1 isn't chased in
// 0.5.0 code. Vite inlines this from package.json at build time — see the
// `define` note at the bottom of this file.
declare const __APP_VERSION__: string;

interface SubmitContext {
  /** Current route the user was on (e.g. "/trips/123?tab=Budget"). */
  route?: string | null;
  /** Trip they were viewing, if any. */
  tripId?: string | null;
}

interface FeedbackState {
  submitting: boolean;
  error: string | null;

  /**
   * Insert a feedback row. The user supplies category/message/sentiment;
   * everything else (user, route, trip, version, user_agent) is attached here
   * so the caller never has to. Returns true on success.
   */
  submitFeedback: (
    values: FeedbackFormValues,
    context?: SubmitContext,
  ) => Promise<boolean>;

  clearError: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  submitting: false,
  error: null,

  submitFeedback: async (values, context = {}) => {
    set({ submitting: true, error: null });

    const payload = {
      category: values.category,
      message: values.message.trim(),
      sentiment: values.sentiment ?? null,
      contact_email: values.contact_email?.trim(),
      route: context.route ?? null,
      trip_id: context.tripId ?? null,
      app_version:
        typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };

    const { error } = await supabase.from("feedback").insert(payload);

    if (error) {
      set({ submitting: false, error: error.message });
      return false;
    }

    set({ submitting: false });
    return true;
  },

  clearError: () => set({ error: null }),
}));

/*
 * __APP_VERSION__ needs to be defined in vite.config.ts:
 *
 *   import pkg from "./package.json";
 *   export default defineConfig({
 *     define: { __APP_VERSION__: JSON.stringify(pkg.version) },
 *     ...
 *   });
 *
 * (importing package.json needs "resolveJsonModule": true in tsconfig, which
 *  Vite projects usually already have.)
 */
