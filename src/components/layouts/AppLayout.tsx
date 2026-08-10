import { Container, Group, Image, Stack, Title } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import logoImg from "@/assets/logo.svg";
import { Sidebar, SidebarDrawer } from "../nav";

export default function AppLayout() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  if (isMobile) {
    return (
      <Stack gap={0} h="calc(100dvh - 4px)" bg="var(--bg-color)">
        {/* Top bar with the burger + brand, since there's no fixed rail here */}
        <Group
          h="3.25rem"
          px="md"
          gap="sm"
          style={{ borderBottom: "2px solid var(--border-color)" }}
        >
          <SidebarDrawer />
          <Group gap="xs">
            <Image w={22} src={logoImg} />
            <Title order={4} fw="bold">
              zula
            </Title>
          </Group>
        </Group>
        <Container flex={1} mih={0} m={0} p={0}>
          <Outlet />
        </Container>
      </Stack>
    );
  }

  return (
    <Group gap={0} h="calc(100dvh - 4px)" bg="var(--bg-color)">
      <Sidebar />
      <Container h="100%" miw="calc(100% - 15rem)" m={0} p={0}>
        <Outlet />
      </Container>
    </Group>
  );
}
