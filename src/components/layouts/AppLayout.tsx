import { Group } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../nav";

export default function AppLayout() {
  return (
    <Group gap={0} h="calc(100dvh - 4px)" bg="var(--bg-color)">
      <Sidebar />
      <Outlet />
    </Group>
  );
}
