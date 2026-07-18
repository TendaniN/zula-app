import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";

export default function AppLayout() {
  const { profile, loading } = useAuthStore();

  if (loading) {
    return (
      <Center h="100dvh">
        <Loader size="xl" type="bars" />
      </Center>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ height: "100dvh", width: "100dvw" }}>
      <Outlet />
    </div>
  );
}
