import { Badge, Flex, Group, Image, Stack, Text, Title } from "@mantine/core";
import logoImg from "@/assets/logo.svg";
import "./styles.scss";
import { Link, useLocation } from "react-router-dom";
import {
  PiQuestionBold,
  PiPaperPlaneTiltBold,
  PiUserBold,
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
              <Text>{label}</Text>
            </Group>
          </Link>
        ))}
      </Stack>
      <Stack
        mt="auto"
        style={{ borderTop: "2px dashed var(--border-color)" }}
        pt="md"
      >
        <Group gap="xs">
          <Flex
            bdrs="xl"
            bd="2px solid var(--border-color)"
            className="sidebar__avatar"
            data-role={profile.app_role}
          />
          <Stack gap={2}>
            <Text
              fw={700}
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
        <CurrencySelect />
        <Group>
          <Text fw={700} fz="sm">
            Dark mode
          </Text>
          <ThemeToggle />
        </Group>
      </Stack>
    </Stack>
  );
};
