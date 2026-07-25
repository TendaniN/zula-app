import { Container, Group } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../nav";

export default function AppLayout() {
  return (
    <Group gap={0} h="calc(100dvh - 4px)" bg="var(--bg-color)">
      <Sidebar />
      <Container h="100%" miw="calc(100% - 15rem)" m={0} p="xl">
        <Outlet />
      </Container>
    </Group>
  );
}
