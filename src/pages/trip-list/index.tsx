import { useTripStore } from "@/stores/tripStore";
import {
  Center,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
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
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { TRIP_STATUS_FILTERS, type TripFilter } from "@/constants/status";
import { FilterChip } from "./components/FilterChip";
import { TripCard } from "./components/TripCard";

export default function TripListPage() {
  const { loading, fetchTrips, tripSummaries } = useTripStore();

  const [search, setSearch] = useState("");
  const [filterTrips, setFilterTrips] = useState<TripFilter>("all");

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
        <TripModal />
      </Group>
      <Group>
        <TextInput
          w={{ base: "100%", lg: "50%" }}
          placeholder="Search trips & destinations..."
          leftSection={<PiMagnifyingGlassBold />}
          rightSection={
            search !== "" && (
              <PiXBold
                style={{ cursor: "pointer" }}
                onClick={() => setSearch("")}
              />
            )
          }
          rightSectionPointerEvents="all"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </Group>
      <Group>
        {TRIP_STATUS_FILTERS.map(({ label, id }) => (
          <FilterChip
            key={`filter-chip-${id}`}
            active={filterTrips === id}
            id={id}
            onClick={() => setFilterTrips(id)}
          >
            {label}
          </FilterChip>
        ))}
      </Group>
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
          {tripSummaries
            .filter(
              ({ status }) => filterTrips === "all" || status === filterTrips,
            )
            .map((trip, index) => (
              <TripCard index={index} trip={trip} />
            ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
