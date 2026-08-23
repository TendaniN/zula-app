import { Container, Flex, Group, Image, Stack, Title } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Link, Outlet } from "react-router-dom";
import logoImg from "@/assets/logo.svg";
import { Sidebar, SidebarDrawer } from "../nav";

export default function AppLayout() {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  if (isSmallScreen) {
    return (
      <Stack gap={0} h="calc(100dvh - 4px)" bg="var(--bg-color)">
        {/* Top bar with the burger + brand, since there's no fixed rail here */}
        <Group
          h="3.25rem"
          px="md"
          gap="sm"
          style={{ borderBottom: "2px solid var(--border-color)" }}
          component="header"
        >
          <SidebarDrawer />
          <Flex
            gap="xs"
            component={Link}
            td="none"
            c="var(--text-color)"
            to="/trips"
          >
            <Image w={22} src={logoImg} alt="Zula" />
            <Title order={4} fw="bold">
              zula
            </Title>
          </Flex>
        </Group>
        <Container flex={1} maw="100%" mih={0} m={0} p={0}>
          <Outlet />
        </Container>
      </Stack>
    );
  }

  return (
    <Group gap={0} h="calc(100dvh - 4px)" bg="var(--bg-color)">
      <Sidebar />
      <Container
        component="main"
        h="100%"
        flex={1}
        miw="calc(100% - 15rem)"
        m={0}
        p={0}
      >
        <Outlet />
      </Container>
    </Group>
  );
}
