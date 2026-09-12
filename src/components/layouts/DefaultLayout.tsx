import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { DefaultLoader } from "../ui/DefaultLoader";
import { OnboardingModal } from "../OnboardingModal";
import { useOnboardStore } from "@/stores/onboardStore";

export default function DefaultLayout() {
  const { loading, user, profile, initialize } = useAuthStore();
  const refresh = useOnboardStore((s) => s.refresh);

  const [initialized, setInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    void initialize().finally(() => setInitialized(true));
  }, [initialize]);

  useEffect(() => {
    if (user) {
      void refresh(user.id);
    }
  }, [refresh, user?.id]);

  // Show loader until the auth session has been checked at least once.
  if (!initialized || loading) {
    return <DefaultLoader />;
  }

  if (!user || !profile) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return (
    <>
      <Outlet />
      <OnboardingModal name={profile.first_name} userId={user.id} />
    </>
  );
}
