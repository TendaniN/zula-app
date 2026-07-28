import { useState } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui";
import { useLocationStore } from "@/stores/locationStore";
import { LocationModal } from "./LocationModal";
import { LocationCard } from "./LocationCard";
import { TripCostPanel } from "./TripCostPanel";
import { useTripStore } from "@/stores/tripStore";

interface LocationPanelProps {
  tripId: string;
}

export const LocationPanel = ({ tripId }: LocationPanelProps) => {
  const currentTripSummary = useTripStore((s) => s.currentTripSummary);
  const { locations, accommodationFor } = useLocationStore();
  const [costPanelExpanded, setCostPanelExpanded] = useState(true);

  return (
    <Stack p="lg" gap="lg">
      <Group justify="flex-end">
        <LocationModal
          tripId={tripId}
          trigger={(open) => (
            <Button onClick={open} leftSection={<LuPlus size={16} />}>
              Add a stay
            </Button>
          )}
        />
      </Group>

      <Group align="flex-start" gap="lg" wrap="nowrap">
        {/* Location cards */}
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
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

        {/* Collapsible trip cost panel */}
        <TripCostPanel
          summary={currentTripSummary}
          expanded={costPanelExpanded}
          onToggle={() => setCostPanelExpanded((v) => !v)}
        />
      </Group>
    </Stack>
  );
};
