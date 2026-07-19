import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile, ProfileUpdate } from "@/types/models";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  /** Load the current session + profile and subscribe to auth changes. Call once at app boot. */
  initialize: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    details?: {
      first_name?: string | null;
      last_name?: string | null;
      username?: string | null;
    },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });

      if (session?.user) await get().fetchProfile();

      // Keep the store in sync with future sign-in / sign-out / refresh events.
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        set({ session: nextSession, user: nextSession?.user ?? null });
        if (nextSession?.user) get().fetchProfile();
        else set({ profile: null });
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to initialize auth",
      });
    } finally {
      set({ loading: false });
    }
  },

  signInWithPassword: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ session: data.session, user: data.user });
      await get().fetchProfile();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Sign in failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, details) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: details?.first_name ?? null,
            last_name: details?.last_name ?? null,
            username: details?.username ?? null,
          },
        },
      });
      if (error) throw error;
      set({ session: data.session, user: data.user });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Sign up failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  fetchProfile: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ profile: data });
  },

  updateProfile: async (patch) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    set({ profile: data });
  },
}));
