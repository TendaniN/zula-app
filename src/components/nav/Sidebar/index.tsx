import {
  Badge,
  Flex,
  Group,
  Image,
  Menu,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import logoImg from "@/assets/logo.svg";
import "./styles.scss";
import { Link, useLocation } from "react-router-dom";
import {
  PiQuestionBold,
  PiPaperPlaneTiltBold,
  PiUserBold,
  PiSignOutBold,
} from "react-icons/pi";
import clsx from "clsx";
import { useAuthStore } from "@/stores/authStore";
import { CurrencySelect, ThemeToggle } from "@/components/ui";

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

export const Sidebar = () => {
  const location = useLocation();
  const profile = useAuthStore((s) => s.profile);

  if (!profile) {
    return null;
  }

  return (
    <Stack
      style={{ borderRight: "2px solid var(--border-color)" }}
      w="15rem"
      h="100%"
      p="md"
      className="sidebar"
      gap="xl"
    >
      <Group gap="xs">
        <Image w={24} src={logoImg} />
        <Title order={3} fw="bold">
          zula
        </Title>
      </Group>
      <Stack gap="xs" className="sidebar__nav">
        {MENU_ITEMS.map(({ to, label, icon }) => (
          <Link
            to={to}
            key={`nav-item-${label}`}
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
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <CurrencySelect />
        <Group>
          <Text fw="bold" fz="sm">
            Dark mode
          </Text>
          <ThemeToggle />
        </Group>
      </Stack>
    </Stack>
  );
};
