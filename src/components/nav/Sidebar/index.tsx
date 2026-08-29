import {
  Badge,
  Drawer,
  Flex,
  Group,
  Image,
  Menu,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import logoImg from "@/assets/logo.svg";
import "./styles.scss";
import { Link, useLocation } from "react-router-dom";
import {
  PiQuestionBold,
  PiPaperPlaneTiltBold,
  PiUserBold,
  PiSignOutBold,
  PiListBold,
  PiXBold,
} from "react-icons/pi";
import clsx from "clsx";
import { useAuthStore } from "@/stores/authStore";
import {
  CurrencySelect,
  IconButton,
  ThemeToggle,
  FeedbackModal,
} from "@/components";

const MENU_ITEMS = [
  {
    to: "/trips",
    label: "My trips",
    icon: <PiPaperPlaneTiltBold />,
  },
  {
    to: "/profile",
    label: "User profile",
    icon: <PiUserBold />,
  },
  {
    to: "/help",
    label: "Help",
    icon: <PiQuestionBold />,
  },
] as const;

/**
 * The sidebar's actual content — nav + account menu + settings. Rendered
 * inline in the fixed rail on md+ screens, and inside the Drawer on smaller
 * ones. `onNavigate` lets the drawer close itself when a link is tapped.
 */
const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const profile = useAuthStore((s) => s.profile);

  if (!profile) {
    return null;
  }

  return (
    <Stack h="100%" p="md" className="sidebar" gap="xl">
      <Group gap="xs">
        <Image w={24} src={logoImg} alt="Zula" />
        <Title order={3} fw="bold">
          zula
        </Title>
      </Group>
      <Stack gap="xs" className="sidebar__nav">
        {MENU_ITEMS.map(({ to, label, icon }) => (
          <Link
            to={to}
            key={`sidebar-item-${label}`}
            onClick={onNavigate}
            className={clsx("sidebar__nav--item", {
              active: to === location.pathname,
            })}
          >
            <Group>
              {icon}
              <Text fz="sm">{label}</Text>
            </Group>
          </Link>
        ))}
        <FeedbackModal />
      </Stack>
      <Stack
        mt="auto"
        style={{ borderTop: "2px dashed var(--border-color)" }}
        pt="md"
      >
        <Menu position="top">
          <Menu.Target>
            <Group
              gap="xs"
              bd="2px solid var(--border-color)"
              bdrs="md"
              className="sidebar__menu"
              p="0.3rem"
              style={{ cursor: "pointer" }}
            >
              <Flex
                bdrs="xl"
                bd="2px solid var(--border-color)"
                className="sidebar__menu--avatar"
                data-role={profile.app_role}
              />
              <Stack gap={2}>
                <Text
                  fw="bold"
                  fz="sm"
                >{`${profile.first_name} ${profile.last_name}`}</Text>
                <Badge
                  size="xs"
                  bd={`2px solid ${profile.app_role === "admin" ? "peach.6" : "mint.6"}`}
                  color={profile.app_role === "admin" ? "peach" : "mint"}
                >
                  {profile.app_role}
                </Badge>
              </Stack>
            </Group>
          </Menu.Target>
          <Menu.Dropdown
            styles={{ dropdown: { border: "2px solid var(--border-color)" } }}
            maw="12rem"
          >
            <Stack px={12} py={10} gap={0}>
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                Signed in as
              </Text>
              <Text size="sm" textWrap="wrap">
                {profile.username}
                <Text
                  size="xs"
                  textWrap="wrap"
                  component="span"
                >{` (${profile.email})`}</Text>
              </Text>
            </Stack>
            <Menu.Divider />
            <Menu.Item
              leftSection={<PiSignOutBold />}
              component={Link}
              to="/logout"
              onClick={onNavigate}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <CurrencySelect />
        <ThemeToggle />
      </Stack>
    </Stack>
  );
};

/**
 * Fixed sidebar rail for md+ screens. AppLayout only renders this when the
 * viewport is wide enough (see AppLayout), so it's always the full-width rail.
 */
export const Sidebar = () => {
  const profile = useAuthStore((s) => s.profile);
  if (!profile) return null;

  return (
    <Stack
      style={{ borderRight: "2px solid var(--border-color)" }}
      w="15rem"
      h="100%"
      gap={0}
      component="nav"
      aria-label="Primary"
    >
      <SidebarContent />
    </Stack>
  );
};

/**
 * The small-screen entry point: a Burger button that opens the sidebar as a
 * Drawer. Closes automatically when the route changes (so tapping a nav item
 * dismisses it) and when a link fires onNavigate.
 */
export const SidebarDrawer = () => {
  const profile = useAuthStore((s) => s.profile);
  const [opened, { open, close }] = useDisclosure(false);
  const location = useLocation();

  // Close on route change — covers nav taps, back/forward, and programmatic
  // navigation alike.
  useEffect(() => {
    close();
  }, [location.pathname]);

  if (!profile) return null;

  return (
    <Group py="xs">
      <IconButton
        onClick={open}
        size="sm"
        variant="ghost"
        icon={opened ? <PiXBold /> : <PiListBold />}
        aria-label="Open sidebar"
      />
      <Drawer
        opened={opened}
        onClose={close}
        size="15rem"
        padding={0}
        withCloseButton={false}
        overlayProps={{ blur: 2 }}
        styles={{
          body: { height: "100%" },
          content: { display: "flex", flexDirection: "column" },
        }}
      >
        <SidebarContent onNavigate={close} />
      </Drawer>
    </Group>
  );
};
