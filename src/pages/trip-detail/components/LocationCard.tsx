import {
  Badge,
  Card,
  Box,
  Group,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { FaPencil, FaRegTrashCan, FaStar, FaTrash } from "react-icons/fa6";
import { TbDots } from "react-icons/tb";
import { LuMoveRight } from "react-icons/lu";

import { IconButton, Button } from "@/components/ui";
import { getCountryFlag } from "@/utils/getCountryFlag";
import { calcNights } from "@/utils/calcNights";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Location, Accommodation } from "@/types/models";
import dayjs from "dayjs";
import { LocationModal } from "./LocationModal";
import { useLocationStore } from "@/stores/locationStore";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router-dom";
import { CanEditTrip } from "@/components/auth/CanEditTrip";

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
  const { accommodationFor, deleteLocation } = useLocationStore();
  const currency = useCurrencyStore((s) => s.symbol);

  // Controlled edit modal + delete confirm state.
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const nights =
    location.start_date && location.end_date
      ? calcNights(location.start_date, location.end_date)
      : 0;

  const accommodationTotal = accommodation
    ? accommodation.cost_per_night * nights
    : 0;

  const dateRange =
    location.start_date && location.end_date
      ? `${dayjs(location.start_date).format("D")} - ${dayjs(location.end_date).format("D MMM")}`
      : "Dates TBC";
  const confirmDelete = async () => {
    await deleteLocation(location.id);
    closeDelete();
  };
  return (
    <Card
      radius="lg"
      p={0}
      style={{
        boxShadow: `0 4px 0 var(--mantine-primary-color-1)`,
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
              <Text fw={700} size="md">
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
                {accommodationTotal.toLocaleString()}
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
                  <LocationModal
                    location={location}
                    tripId={tripId}
                    accommodation={accommodationFor(location.id)}
                    trigger={(open) => (
                      <Menu.Item
                        leftSection={<FaPencil size={13} />}
                        onClick={open}
                      >
                        Edit
                      </Menu.Item>
                    )}
                  />

                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<FaRegTrashCan size={13} />}
                    onClick={openDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </CanEditTrip>
          </Group>
        </Group>

        {/* Accommodation sub-row */}
        {accommodation && (
          <Stack
            justify="space-between"
            p="md"
            gap={0}
            style={{
              background: `var(--mantine-color-${TYPE_COLOR[accommodation.type]}-0)`,
            }}
          >
            <Group gap="xs" wrap="nowrap">
              <Text fw={700} size="sm">
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
                    <FaStar size={12} />
                    <Text size="xs" fw={600}>
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
        )}
        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          centered
          size="sm"
          title={
            <Stack gap="xs">
              <Box
                p="sm"
                bdrs="md"
                bd="2px solid red.3"
                bg="red.1"
                w="2.75rem"
                c="red.8"
              >
                <FaTrash />
              </Box>
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
