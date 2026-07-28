import { useLocationStore } from "@/stores/locationStore";
import { useTripStore } from "@/stores/tripStore";
import { Center, Image, Stack, Text, Title } from "@mantine/core";
import { Navigate, useParams } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import "./styles.scss";
import noLocationsImg from "@/assets/icons/empty-no-locations.svg";
import { LocationModal } from "./components/LocationModal";
import { Button } from "@/components/ui";
import { LocationPanel } from "./components/LocationPanel";

export default function TripDetailPage() {
  const { currentTripSummary } = useTripStore();
  const { locations } = useLocationStore();

  const { tripId } = useParams();

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
    <LocationPanel tripId={tripId} />
  );
}
