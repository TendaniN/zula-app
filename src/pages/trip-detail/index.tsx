import { useLocationStore } from "@/stores/locationStore";
import { useTripStore } from "@/stores/tripStore";
import { Center, Group, Image, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PiArrowRight, PiPlus } from "react-icons/pi";
import "./styles.scss";
import noLocationsImg from "@/assets/icons/empty-no-locations.svg";
import { LocationModal } from "./components/LocationModal";
import { Button } from "@/components/ui";
import { LocationCard } from "./components/LocationCard";
import { TripCostPanel } from "./components/TripCostPanel";

export default function TripDetailPage() {
  const { currentTripSummary } = useTripStore();
  const { accommodationFor, locations } = useLocationStore();

  const { tripId } = useParams();

  const [costPanelExpanded, setCostPanelExpanded] = useState(true);

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  // Only redirect after the fetch has completed and genuinely returned nothing.
  if (!currentTripSummary) {
    return <Navigate to="/trips" replace />;
  }

  return locations.length === 0 ? (
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
        <Image src={noLocationsImg} w="8rem" h="6.5rem" />
        <Title order={3} ta="center" fw="semibold">
          Where are you headed?
        </Title>
        <Text c="dimmed" ta="center">
          Add your first location to start building the itinerary. Stays,
          activities, transport and budget all hang off your stops.
        </Text>
        <LocationModal
          tripId={tripId}
          trigger={(open) => (
            <Button leftSection={<PiArrowRight />} onClick={open}>
              Add a your first stay
            </Button>
          )}
        />
      </Center>
    </Stack>
  ) : (
    <Stack p="lg" gap="lg">
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          <Group justify="flex-end">
            <LocationModal
              tripId={tripId}
              trigger={(open) => (
                <Button onClick={open} leftSection={<PiPlus />}>
                  Add a stay
                </Button>
              )}
            />
          </Group>
          {locations.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No stays yet — add your first one to get started.
            </Text>
          ) : (
            locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                accommodation={accommodationFor(location.id)}
                tripId={tripId}
              />
            ))
          )}
        </Stack>
        <TripCostPanel
          summary={currentTripSummary}
          expanded={costPanelExpanded}
          onToggle={() => setCostPanelExpanded((v) => !v)}
        />
      </Group>
    </Stack>
  );
}
