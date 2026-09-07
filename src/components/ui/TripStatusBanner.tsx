import { Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PiFlagCheckeredBold, PiPaperPlaneTiltBold } from "react-icons/pi";

import { useTripStore } from "@/stores/tripStore";
import { usePermissions } from "@/hooks/usePermissions";
import { getTripCountdown } from "@/utils/getTripCountdown";
import { TripModal } from "@/pages/trip-list/components/TripModal";

export const TripStatusBanner = () => {
  const currentTrip = useTripStore((s) => s.currentTrip);
  const { canEdit } = usePermissions();
  const [editOpened, { open, close }] = useDisclosure(false);

  if (!currentTrip || !canEdit) return null;

  const status = currentTrip.status;
  // Archived is intentional — don't nudge it back to active/completed.
  if (status === "archived") return null;

  const { phase, daysUntilStart, label } = getTripCountdown(currentTrip);

  const suggestCompleted = phase === "ended" && status !== "completed";
  const suggestActive =
    (phase === "today" ||
      phase === "in-progress" ||
      (phase === "upcoming" && daysUntilStart <= 7)) &&
    status !== "active";

  if (!suggestCompleted && !suggestActive) return null;

  const config = suggestCompleted
    ? {
        color: "peach",
        icon: <PiFlagCheckeredBold />,
        title: "This trip has wrapped up",
        body: "Mark it completed to lock the record so it isn't changed by accident.",
        cta: "Mark completed",
      }
    : {
        color: "mint",
        icon: <PiPaperPlaneTiltBold />,
        title: "This trip is under way",
        // Reuse the countdown label ("Today!", "Day 3 of 12", "5 days to go").
        body: `${label} — set it to active so everyone sees it's happening.`,
        cta: "Mark active",
      };

  return (
    <>
      <Group
        wrap="nowrap"
        align="center"
        gap="sm"
        p="md"
        bdrs="lg"
        style={{
          border: `2px solid var(--mantine-color-${config.color}-4)`,
          background: `var(--mantine-color-${config.color}-0)`,
        }}
      >
        <ThemeIcon
          variant="light"
          color={config.color}
          radius="md"
          size="lg"
          style={{ flexShrink: 0 }}
        >
          {config.icon}
        </ThemeIcon>
        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={800} size="sm">
            {config.title}
          </Text>
          <Text size="xs" c="dimmed">
            {config.body}
          </Text>
        </Stack>
        <Button
          size="xs"
          color={config.color}
          variant="light"
          onClick={open}
          style={{ flexShrink: 0 }}
        >
          {config.cta}
        </Button>
      </Group>

      {/* Opens the trip in edit mode, where the status Select lives. */}
      <TripModal trip={currentTrip} opened={editOpened} onClose={close} />
    </>
  );
};
