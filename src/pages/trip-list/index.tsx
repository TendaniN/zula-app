import { useTripStore } from "@/stores/tripStore";
import {
  Center,
  Flex,
  Group,
  Image,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  PiArrowRight,
  PiDotBold,
  PiMagnifyingGlassBold,
  PiXBold,
} from "react-icons/pi";
import noTripsImg from "@/assets/icons/empty-no-trips.svg";
import noMatchesImg from "@/assets/icons/empty-no-matches.svg";
import { TripModal } from "./components/TripModal";
import { Button, IconButton } from "@/components/ui";
import { useEffect, useState } from "react";
import { TRIP_STATUS_FILTERS, type TripFilter } from "@/constants/status";
import { FilterChip } from "./components/FilterChip";
import { TripCard } from "./components/TripCard";
import { useMediaQuery } from "@mantine/hooks";

export default function TripListPage() {
  const theme = useMantineTheme();
  const { loading, fetchTrips, tripSummaries } = useTripStore();

  const [search, setSearch] = useState("");
  const [filterTrips, setFilterTrips] = useState<TripFilter>("all");

  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const getTrips = async () => {
    await fetchTrips();
  };

  useEffect(() => {
    getTrips();
  }, []);

  if (!loading && tripSummaries.length === 0) {
    return (
      <Stack p="xl">
        <Group justify="space-between">
          <Stack>
            <Title fw="bold">My trips</Title>
            <Text fz="sm" c="dimmed">
              Packed bags. Packed itinerary ✨
            </Text>
          </Stack>
        </Group>
        <Stack
          p="xl"
          bdrs="lg"
          bd="2px dashed var(--muted)"
          style={{
            backgroundColor:
              "light-dark(var(--mantine-color-white), var(--mantine-color-black))",
          }}
        >
          <Center
            display="flex"
            style={{
              flexDirection: "column",
              justifyContent: "center",
              gap: "0.75rem",
            }}
            p="xl"
          >
            <Image src={noTripsImg} w="8rem" h="6.5rem" />
            <Title order={3} ta="center" fw="semibold">
              No trips yet
            </Title>
            <Text c="dimmed" ta="center">
              Your next adventure starts here. Create a trip to add stays, plan
              your itinerary and track the budget.
            </Text>
            <TripModal
              trigger={(open) => (
                <Button rightSection={<PiArrowRight />} onClick={open}>
                  Plan your first trip
                </Button>
              )}
            />
          </Center>
        </Stack>
      </Stack>
    );
  }

  if (loading) {
    return (
      <Stack p="xl">
        <Group justify="space-between">
          <Stack>
            <Title fw="bold">My trips</Title>
            <Text fz="sm" c="dimmed">
              Packed bags. Packed itinerary ✨
            </Text>
          </Stack>
        </Group>
        <Stack
          p="xl"
          bdrs="lg"
          bd="2px dashed var(--muted)"
          style={{
            backgroundColor:
              "light-dark(var(--mantine-color-white), var(--mantine-color-black))",
          }}
        >
          <Center
            display="flex"
            style={{
              flexDirection: "column",
              justifyContent: "center",
              gap: "0.75rem",
            }}
            p="xl"
          >
            <Loader size="xl" />
          </Center>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack p="xl">
      <Group justify="space-between">
        <Stack>
          <Title fw="bold">My trips</Title>
          <Group gap={2} c="dimmed">
            <Text fz="sm">{`${tripSummaries.length} trip${tripSummaries.length > 1 ? "s" : ""}`}</Text>
            <PiDotBold />
            <Text fz="sm">Packed bags. Packed itinerary ✨</Text>
          </Group>
        </Stack>
        {tripSummaries.length > 0 && <TripModal />}
      </Group>
      {tripSummaries.length > 0 && (
        <Flex
          gap="sm"
          direction={{ base: "column", xs: "row" }}
          align={{ base: "stretch", sm: "normal" }}
        >
          <TextInput
            flex={1}
            w="100%"
            placeholder="Search trips & destinations..."
            leftSection={<PiMagnifyingGlassBold />}
            rightSection={
              search ? (
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<PiXBold />}
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                />
              ) : undefined
            }
            rightSectionPointerEvents="all"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          {isSmallScreen ? (
            <Select
              value={filterTrips}
              data={TRIP_STATUS_FILTERS.map(({ id, label }) => ({
                value: id,
                label,
              }))}
              onChange={(v) =>
                setFilterTrips(
                  (v ?? TRIP_STATUS_FILTERS[0].id) as typeof filterTrips,
                )
              }
              allowDeselect={false}
              checkIconPosition="right"
              comboboxProps={{ withinPortal: true }}
            />
          ) : (
            <Group gap="xs">
              {TRIP_STATUS_FILTERS.map(({ label, id }) => (
                <FilterChip
                  key={id}
                  id={id}
                  active={filterTrips === id}
                  onClick={() => setFilterTrips(id)}
                >
                  {label}
                </FilterChip>
              ))}
            </Group>
          )}
        </Flex>
      )}

      {tripSummaries.filter(
        ({ status }) => filterTrips === "all" || status === filterTrips,
      ).length === 0 ? (
        <Stack
          p="xl"
          bdrs="lg"
          bd="2px dashed var(--muted)"
          style={{
            backgroundColor:
              "light-dark(var(--mantine-color-white), var(--mantine-color-black))",
          }}
        >
          <Center
            display="flex"
            style={{
              flexDirection: "column",
              justifyContent: "center",
              gap: "0.75rem",
            }}
            p="xl"
          >
            <Image src={noMatchesImg} w="8rem" h="6.5rem" />
            <Title order={3} ta="center" fw="semibold">
              No trips match
            </Title>
            <Text c="dimmed" ta="center">
              Clear your search and filter by 'All' to see everything.
            </Text>
          </Center>
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 3, xl: 4 }}>
          {tripSummaries
            .filter(
              ({ status }) => filterTrips === "all" || status === filterTrips,
            )
            .map((trip, index) => (
              <TripCard key={`trip-${trip.id}`} index={index} trip={trip} />
            ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
