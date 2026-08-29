import { useLocationStore } from "@/stores/locationStore";
import { useTripStore } from "@/stores/tripStore";
import { Center, Image, Stack, Text, Title } from "@mantine/core";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { PiPlus } from "react-icons/pi";
import "./styles.scss";
import noLocationsImg from "@/assets/icons/empty-no-locations.svg";
import {
  BudgetPanel,
  LocationModal,
  LocationPanel,
  TodoPanel,
  TransportPanel,
} from "./components";
import { Button, CanEditTrip } from "@/components";

export default function TripDetailPage() {
  const { currentTripSummary } = useTripStore();
  const { locations } = useLocationStore();

  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab");

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  // Only redirect after the fetch has completed and genuinely returned nothing.
  if (!currentTripSummary) {
    return <Navigate to="/trips" replace />;
  }

  if (locations.length === 0) {
    return (
      <Stack
        p="xl"
        bdrs="lg"
        className="empty-state"
        bd="2px dashed var(--empty-card-border)"
        bg="var(--surface-color)"
        flex={1}
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
          <Image src={noLocationsImg} w="8rem" h="6.5rem" alt="No Locations" />
          <Title order={3} ta="center" fw="semibold">
            Where are you headed?
          </Title>
          <Text c="dimmed" ta="center">
            Add your first location to start building the itinerary. Stays,
            activities, transport and budget all hang off your stops.
          </Text>
          <CanEditTrip>
            <LocationModal
              tripId={tripId}
              trigger={(open) => (
                <Button leftSection={<PiPlus />} onClick={open}>
                  Add your first stay
                </Button>
              )}
            />
          </CanEditTrip>
        </Center>
      </Stack>
    );
  }

  switch (activeTab) {
    case "Budget": {
      return <BudgetPanel currentTripSummary={currentTripSummary} />;
    }
    case "Transport": {
      return <TransportPanel tripId={tripId} />;
    }
    case "To-dos": {
      return <TodoPanel tripId={tripId} />;
    }
    default: {
      return <LocationPanel tripId={tripId} />;
    }
  }
}
