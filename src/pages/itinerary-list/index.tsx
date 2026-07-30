import {
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Title,
  Text,
} from "@mantine/core";
import { Navigate, useParams } from "react-router-dom";
import { useActivityStore } from "@/stores/activityStore";
import { useEffect, useState } from "react";
import noActivitiesImg from "@/assets/icons/empty-itinerary.svg";
import { useLocationStore } from "@/stores/locationStore";
import { ActivityModal } from "./components/ActivityModal";
import { Button } from "@/components/ui";
import { PiPlus } from "react-icons/pi";

export default function ItineraryListPage() {
  const { fetchByLocation, loading, activities } = useActivityStore();
  const { locations, fetchByTrip } = useLocationStore();

  const [initialized, setInitialized] = useState(false);

  const { tripId, locationId } = useParams();

  useEffect(() => {
    const load = async (id: string, tripId: string) => {
      fetchByLocation(id);
      if (locations.length === 0) {
        fetchByTrip(tripId);
      }
      setInitialized(true);
    };

    if (locationId && tripId) {
      load(locationId, tripId);
    }
  }, [locationId, tripId]);

  // Show loader until the first fetch resolves.
  if (!initialized || loading) {
    return (
      <Stack flex={1}>
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
    );
  }

  const location = locations.find((s) => s.id === locationId);

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  if (!locationId || !location) {
    return <Navigate to={`/trips/${tripId}`} replace />;
  }

  if (activities.length === 0) {
    return (
      <Stack
        p="xl"
        bdrs="lg"
        bd="2px dashed var(--muted)"
        flex={1}
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
          <Image src={noActivitiesImg} w="8rem" h="6.5rem" />
          <Title order={3} ta="center" fw="semibold">
            Three days, wide open
          </Title>
          <Text c="dimmed" ta="center">
            Add activities, meals or notes to your {location.city} days.
            Anything with a price rolls into the budget.
          </Text>
          <ActivityModal
            locationId={locationId}
            trigger={(open) => (
              <Button leftSection={<PiPlus />} onClick={open}>
                Add your activity
              </Button>
            )}
          />
        </Center>
      </Stack>
    );
  }

  return (
    <Stack p="lg" gap="lg">
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          <Group justify="flex-end"></Group>
        </Stack>
      </Group>
    </Stack>
  );
}
