import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { DefaultLoader } from "../ui/DefaultLoader";

export default function DefaultLayout() {
  const { loading, user, profile, initialize } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    initialize().finally(() => setInitialized(true));
  }, []);

  // Show loader until the auth session has been checked at least once.
  if (!initialized || loading) {
    return <DefaultLoader />;
  }

  if (!user && !profile) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
