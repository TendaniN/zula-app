import { Group, Stack, Text } from "@mantine/core";

import { Button } from "@/components/ui";
import { useLocationStore } from "@/stores/locationStore";
import { LocationModal } from "./LocationModal";
import { LocationCard } from "./LocationCard";
import { PiPlus } from "react-icons/pi";
import { CanEditTrip } from "@/components/auth";

interface LocationPanelProps {
  tripId: string;
}

export const LocationPanel = ({ tripId }: LocationPanelProps) => {
  const { locations, accommodationFor } = useLocationStore();

  return (
    <Stack gap="md" flex={1} miw={0}>
      <Group justify="flex-end">
        <CanEditTrip>
          <LocationModal
            tripId={tripId}
            trigger={(open) => (
              <Button onClick={open} leftSection={<PiPlus />}>
                Add a stay
              </Button>
            )}
          />
        </CanEditTrip>
      </Group>
      {locations.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No stays yet - add your first one to get started.
        </Text>
      ) : (
        locations.map((location) => (
          <LocationCard
            key={`location-${location.id}`}
            location={location}
            accommodation={accommodationFor(location.id)}
            tripId={tripId}
          />
        ))
      )}
    </Stack>
  );
};
