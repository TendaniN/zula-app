import {
  Badge,
  Card,
  Group,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  FaPencil,
  FaPlus,
  FaRegTrashCan,
  FaStar,
  FaTrash,
} from "react-icons/fa6";
import { TbDots } from "react-icons/tb";
import { LuMoveRight } from "react-icons/lu";

import { IconButton, Button } from "@/components/ui";
import { getCountryFlag } from "@/utils/getCountryFlag";
import { calcNights } from "@/utils/calcNights";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Location, Accommodation } from "@/types/models";
import { LocationModal } from "./LocationModal";
import { useLocationStore } from "@/stores/locationStore";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router-dom";
import { CanEditTrip } from "@/components/auth";
import { formatDate } from "@/utils/date";

const TYPE_COLOR: Record<Accommodation["type"], string> = {
  hotel: "lavender",
  airbnb: "mint",
  hostel: "peach",
  guesthouse: "peach",
  resort: "lavender",
  other: "gray",
};

const TYPE_LABEL: Record<Accommodation["type"], string> = {
  hotel: "Hotel",
  airbnb: "Airbnb",
  hostel: "Hostel",
  guesthouse: "Guesthouse",
  resort: "Resort",
  other: "Other",
};

interface LocationCardProps {
  location: Location;
  accommodation?: Accommodation;
  tripId: string;
}

export const LocationCard = ({
  location,
  accommodation,
  tripId,
}: LocationCardProps) => {
  const { accommodationFor, deleteLocation, locationSummaries } =
    useLocationStore();
  const currency = useCurrencyStore((s) => s.symbol);

  const summary = locationSummaries.find((s) => s.location_id === location.id);

  // Controlled edit modal + delete confirm state.
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const nights =
    location.start_date && location.end_date
      ? calcNights(location.start_date, location.end_date)
      : 0;

  const accommodationTotal = accommodation
    ? accommodation.cost_per_night * nights
    : 0;

  const total = summary ? (summary.location_total ?? 0) : accommodationTotal;

  const dateRange =
    location.start_date && location.end_date
      ? `${formatDate(location.start_date, "D")} - ${formatDate(location.end_date, "D MMM")}`
      : "Dates TBC";

  const confirmDelete = async () => {
    await deleteLocation(location.id);
    closeDelete();
  };
  return (
    <Card
      radius="lg"
      p={0}
      shadow="xl"
      style={{
        boxShadow: `0 4px 0 var(--bg-secondary)`,
      }}
    >
      <Stack gap={0} p={0}>
        <Group
          justify="space-between"
          wrap="nowrap"
          p="md"
          style={{ borderBottom: "2px solid var(--border-color)" }}
        >
          <Group gap="sm" wrap="nowrap">
            {location.country &&
              getCountryFlag(
                location.country,
                36,
                "1px solid var(--border-color)",
              )}
            <Stack gap={0}>
              <Text fw="bold" size="md">
                {location.city}
                {location.country ? `, ${location.country}` : ""}
              </Text>
              <Text size="xs" c="dimmed">
                {dateRange} · {nights} {nights === 1 ? "night" : "nights"}
              </Text>
            </Stack>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Stack gap={0} align="flex-end">
              <Text size="xs" c="dimmed">
                Location total
              </Text>
              <Text fw={800} size="lg">
                {currency}
                {total.toLocaleString()}
              </Text>
            </Stack>
            <CanEditTrip>
              <Menu position="bottom-end" withinPortal shadow="md">
                <Menu.Target>
                  <IconButton
                    icon={<TbDots />}
                    variant="ghost"
                    size="sm"
                    aria-label="Location options"
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<FaPencil />} onClick={openEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<FaRegTrashCan />}
                    onClick={openDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </CanEditTrip>
          </Group>
        </Group>

        {accommodation ? (
          <Stack
            justify="space-between"
            p="md"
            gap={0}
            bg="var(--bg-secondary)"
          >
            <Group gap="xs" wrap="nowrap">
              <Text fw="bold" size="sm">
                {accommodation.name}
              </Text>
              <Badge
                variant="filled"
                color={`${TYPE_COLOR[accommodation.type]}.3`}
                c="var(--text-color)"
                tt="capitalize"
                bd={`2px solid ${TYPE_COLOR[accommodation.type]}.5`}
              >
                {TYPE_LABEL[accommodation.type]}
              </Badge>
            </Group>
            <Group gap="md" wrap="nowrap" justify="space-between">
              <Group gap="xs">
                {accommodation.rating != null && (
                  <Group gap={4} wrap="nowrap" c="dimmed">
                    <Text size="xs" fw={600} c="dimmed">
                      <FaStar size="0.65rem" />{" "}
                      {accommodation.rating.toFixed(1)}
                    </Text>
                  </Group>
                )}
                <Text size="xs" c="dimmed">
                  {currency}
                  {accommodation.cost_per_night} / night
                </Text>
              </Group>
              <Link
                to={`/trips/${tripId}/locations/${location.id}?tab=Stays & itinerary`}
                className="link-button"
              >
                View itinerary
                <LuMoveRight />
              </Link>
            </Group>
          </Stack>
        ) : (
          <Group
            justify="space-between"
            p="md"
            gap={0}
            bg="var(--bg-secondary)"
          >
            <Text c="dimmed" fs="italic">
              No accommodation yet.
            </Text>
            <Group>
              <CanEditTrip>
                <LocationModal
                  location={location}
                  tripId={tripId}
                  accommodation={accommodationFor(location.id)}
                  trigger={(open) => (
                    <Button
                      variant="dashed"
                      onClick={open}
                      size="xs"
                      leftSection={<FaPlus />}
                    >
                      Add accommodation
                    </Button>
                  )}
                />
              </CanEditTrip>
              <Link
                to={`/trips/${tripId}/locations/${location.id}?tab=Stays & itinerary`}
                className="link-button"
              >
                View itinerary
                <LuMoveRight />
              </Link>
            </Group>
          </Group>
        )}

        {/* Controlled edit modal — rendered outside the Menu above so it
            survives the menu closing. */}
        <LocationModal
          location={location}
          tripId={tripId}
          accommodation={accommodationFor(location.id)}
          opened={editOpened}
          onClose={closeEdit}
        />

        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          centered
          size="sm"
          title={
            <Stack gap="xs">
              <ThemeIcon color="red" radius="md">
                <FaTrash />
              </ThemeIcon>
              <Title order={4} lh={1} fw="bold">
                Delete this location?
              </Title>
            </Stack>
          }
        >
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              {`Delete "${location.city}"? This also removes its accommodation and activities. This can't be undone.`}
            </Text>
            <SimpleGrid cols={2}>
              <Button fluid variant="ghost" onClick={closeDelete}>
                Cancel
              </Button>
              <Button fluid variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </SimpleGrid>
          </Stack>
        </Modal>
      </Stack>
    </Card>
  );
};
