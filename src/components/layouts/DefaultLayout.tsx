import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";

export default function DefaultLayout() {
  const { loading, user, profile } = useAuthStore();

  if (loading) {
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
