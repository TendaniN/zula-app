import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";

export default function AppLayout() {
  const { profile, loading } = useAuthStore();

  if (loading) {
    return (
      <Center h="100%">
        <Loader size="xl" type="bars" />
      </Center>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
