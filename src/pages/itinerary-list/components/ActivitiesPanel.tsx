import {
  Group,
  Stack,
  Text,
  ThemeIcon,
  Badge,
  Divider,
  Menu,
  Anchor,
  useMantineTheme,
} from "@mantine/core";
import { ActivityModal } from "./ActivityModal";
import { Button, IconButton, DeleteModal } from "@/components/ui";
import { PiPlus, PiDotsThreeBold } from "react-icons/pi";
import { FaPencil, FaRegTrashCan, FaLink } from "react-icons/fa6";
import dayjs from "dayjs";
import { CanEditTrip } from "@/components/auth";
import type { Activity, ActivityType, Location } from "@/types/models";
import { calcNights } from "@/utils/calcNights";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { useActivityStore } from "@/stores/activityStore";
import { formatDuration } from "@/utils/formatDuration";
import { formatDate } from "@/utils/date";

const ACTIVITY_TYPE_COLOR: Record<ActivityType, string> = {
  breakfast: "lavender",
  brunch: "lavender",
  lunch: "lavender",
  dinner: "lavender",
  cafe: "lavender",
  drinks: "lavender",
  tour: "mint",
  sightseeing: "mint",
  museum: "mint",
  attraction: "mint",
  hike: "peach",
  outdoor: "peach",
  beach: "peach",
  shopping: "indigo",
  entertainment: "indigo",
  wellness: "indigo",
  other: "gray",
};

interface DayGroup {
  date: string; // YYYY-MM-DD
  index: number; // Day 1, Day 2, ...
  activities: Activity[];
  total: number;
}

interface ActivitiesPanelProps {
  location: Location;
  activities: Activity[];
}

export const ActivitiesPanel = ({
  location,
  activities,
}: ActivitiesPanelProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  // Controlled edit modal — rendered OUTSIDE the Menu below. Menu.Item
  // closes (and unmounts) its Menu.Dropdown on click by default, so a
  // modal nested inside it gets torn down before it can show. Lifting the
  // opened/activity state here and rendering the modal as a sibling of the
  // Menu (not a child) avoids that.
  const [editTarget, setEditTarget] = useState<Activity | null>(null);
  const [editOpened, { open: openEdit, close: closeEditRaw }] =
    useDisclosure(false);

  const deleteActivity = useActivityStore((s) => s.deleteActivity);
  const currency = useCurrencyStore((s) => s.symbol);

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const nights = calcNights(location.start_date, location.end_date);

  const days: DayGroup[] = [];

  if (location.start_date && nights > 0) {
    for (let i = 0; i < nights; i++) {
      const date = dayjs(location.start_date)
        .add(i, "day")
        .format("YYYY-MM-DD");
      const dayActivities = activities
        .filter((a) => a.activity_date === date)
        .sort((a, b) =>
          (a.activity_time ?? "").localeCompare(b.activity_time ?? ""),
        );
      days.push({
        date,
        index: i + 1,
        activities: dayActivities,
        total: dayActivities.reduce((sum, a) => sum + (a.cost ?? 0), 0),
      });
    }
  }

  const closeEdit = () => {
    closeEditRaw();
    setEditTarget(null);
  };

  const handleEdit = (activity: Activity) => {
    setEditTarget(activity);
    openEdit();
  };

  const handleDeleteRequest = (activity: Activity) => {
    setDeleteTarget(activity);
    openDelete();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteActivity(deleteTarget.id);
    setDeleteTarget(null);
    closeDelete();
  };

  return (
    <Stack gap="lg" p="md">
      {days.map((day) => (
        <Stack key={`activity-day-${day.date}`} gap="xs">
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
              <Text
                fw="bold"
                fz={{ base: "sm", sm: "md" }}
              >{`Day ${day.index}`}</Text>
              <Text c="dimmed" fz={{ base: "xs", sm: "sm" }}>
                {formatDate(day.date, "ddd D MMM")}
              </Text>
            </Group>
            <Divider
              flex={1}
              size={isSmallScreen ? "sm" : "md"}
              styles={{
                root: {
                  "--divider-color":
                    "light-dark(var(--mantine-color-mint-1), var(--mantine-color-mint-9))",
                },
              }}
            />
            {day.total > 0 && (
              <Text
                fw="bold"
                c="dimmed"
                style={{ flexShrink: 0 }}
                fz={{ base: "xs", sm: "sm" }}
              >
                {currency}
                {day.total}
              </Text>
            )}
          </Group>

          {day.activities.length === 0 ? (
            <CanEditTrip
              fallback={
                <Text c="dimmed" size="sm" fw={600} fs="italic">
                  Nothing planned
                </Text>
              }
            >
              <ActivityModal
                locationId={location.id}
                defaultActivityDate={day.date}
                trigger={(open) => (
                  <Button
                    variant="dashed"
                    onClick={open}
                    size="sm"
                    fluid
                    leftSection={<PiPlus />}
                  >
                    <Text c="dimmed" size="sm" fw={600}>
                      Nothing planned - add something
                    </Text>
                  </Button>
                )}
              />
            </CanEditTrip>
          ) : (
            <>
              <Stack gap="xs">
                {day.activities.map((activity, idx) => (
                  <>
                    <Group
                      key={`activity-${activity.id}`}
                      justify="space-between"
                      wrap="nowrap"
                      gap="sm"
                    >
                      <Group gap="sm" wrap="nowrap" miw={0}>
                        {activity.activity_time && (
                          <Badge
                            variant="light"
                            color="mint"
                            radius="sm"
                            p="xs"
                            size={isSmallScreen ? "xs" : "md"}
                            bd="2px solid mint.4"
                            miw="3.075rem"
                          >
                            {activity.activity_time.slice(0, 5)}
                          </Badge>
                        )}
                        <Text
                          fw={600}
                          size="sm"
                          truncate
                          fz={{ base: "xs", sm: "sm" }}
                        >
                          <Text
                            fw="bold"
                            component="span"
                            c={ACTIVITY_TYPE_COLOR[activity.type]}
                            tt="capitalize"
                            fz={{ base: "xs", sm: "sm" }}
                          >
                            {activity.type}
                          </Text>{" "}
                          - {activity.name}
                        </Text>
                        {activity.link && (
                          <Anchor href={activity.link} target="_blank">
                            <ThemeIcon
                              variant="filled"
                              color="peach.3"
                              c="peach.8"
                              radius="sm"
                              size="sm"
                              bd="2px solid peach.8"
                              p={2}
                            >
                              <FaLink size="1rem" />
                            </ThemeIcon>
                          </Anchor>
                        )}
                      </Group>

                      <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }}>
                        {activity.duration_minutes != null && (
                          <Text c="dimmed" fz={{ base: "xs", sm: "sm" }}>
                            {formatDuration(activity.duration_minutes)}
                          </Text>
                        )}
                        {activity.cost > 0 && (
                          <Text fw="bold" fz={{ base: "xs", sm: "sm" }}>
                            {currency}
                            {activity.cost}
                          </Text>
                        )}
                        <CanEditTrip>
                          <Menu position="bottom-end" withinPortal shadow="md">
                            <Menu.Target>
                              <IconButton
                                icon={<PiDotsThreeBold />}
                                variant="ghost"
                                size={isSmallScreen ? "xs" : "sm"}
                                aria-label="Activity options"
                              />
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<FaPencil />}
                                onClick={() => handleEdit(activity)}
                              >
                                Edit activity
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={<FaRegTrashCan />}
                                onClick={() => handleDeleteRequest(activity)}
                              >
                                Delete activity
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </CanEditTrip>
                      </Group>
                    </Group>
                    <Divider
                      key={`divider-${activity.id}`}
                      display={
                        idx === day.activities.length - 1 ? "none" : "block"
                      }
                      flex={1}
                      size="xs"
                    />
                  </>
                ))}
              </Stack>
              <CanEditTrip>
                <ActivityModal
                  locationId={location.id}
                  defaultActivityDate={day.date}
                  trigger={(open) => (
                    <Button
                      variant="dashed"
                      onClick={open}
                      size="xs"
                      fluid
                      leftSection={
                        <PiPlus
                          style={{ color: "var(--mantine-color-dimmed)" }}
                        />
                      }
                    >
                      <Text c="dimmed" size="xs">
                        {`Add to Day ${day.index}`}
                      </Text>
                    </Button>
                  )}
                />
              </CanEditTrip>
              <Divider flex={1} size="xs" />
            </>
          )}
        </Stack>
      ))}

      {/* Controlled edit modal — one instance, shared by every activity's
          menu, rendered outside all the Menus above so it survives them
          closing. */}
      <ActivityModal
        locationId={location.id}
        activity={editTarget ?? undefined}
        opened={editOpened}
        onClose={closeEdit}
      />

      {deleteTarget && (
        <DeleteModal
          opened={deleteOpened}
          close={closeDelete}
          confirm={confirmDelete}
          item="activity"
          name={deleteTarget.name}
        />
      )}
    </Stack>
  );
};
