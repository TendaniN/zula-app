import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/models";

interface AuthState {
  session: Session | null;
  profile: Profile | null; // carries app_role ('admin' | 'user')
  loading: boolean;
  initialized: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  session: null,
  profile: null,
  loading: true,
  initialized: false,
}));

async function loadProfile(session: Session | null) {
  if (!session) {
    useAuthStore.setState({ profile: null, loading: false });
    return;
  }
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  useAuthStore.setState({ profile: data, loading: false });
}

/** Boot once from AppProviders; keeps the store in sync with Supabase auth. */
export function initAuth() {
  if (useAuthStore.getState().initialized) return;
  useAuthStore.setState({ initialized: true });

  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session });
    loadProfile(data.session);
  });
  supabase.auth.onAuthStateChange((_e, session) => {
    useAuthStore.setState({ session, loading: true });
    loadProfile(session);
  });
}
