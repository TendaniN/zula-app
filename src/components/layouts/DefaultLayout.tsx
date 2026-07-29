import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useEffect, useState } from "react";

export default function DefaultLayout() {
  const { loading, user, profile, initialize } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initialize().finally(() => setInitialized(true));
  }, []);

  // Show loader until the auth session has been checked at least once.
  if (!initialized || loading) {
    return (
      <Center h="100%">
        <Loader size="xl" type="bars" />
      </Center>
    );
  }

  if (!user && !profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
