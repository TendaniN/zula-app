import { useLocationStore } from "@/stores/locationStore";
import { useTripStore } from "@/stores/tripStore";
import {
  Badge,
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { getStatusColor } from "@/constants/status";
import dayjs from "dayjs";
import { calcNights } from "@/utils/calcNights";
import {
  PiCheckSquare,
  PiCreditCard,
  PiDotBold,
  PiArrowRight,
  PiMapPin,
  PiPaperPlaneTilt,
} from "react-icons/pi";
import "./styles.scss";
import noLocationsImg from "@/assets/icons/empty-no-locations.svg";
import { LocationModal } from "./components/LocationModal";
import { Button } from "@/components/ui";

export default function TripDetailPage() {
  const {
    loading: tripLoading,
    currentTripSummary,
    fetchTrip,
  } = useTripStore();
  const {
    loading: locationsLoading,
    fetchByTrip,
    locations,
  } = useLocationStore();

  const { tripId } = useParams();

  // Tracks whether the initial fetch has completed at least once.
  // Without this, the component redirects on refresh before the
  // fetch even starts (loading defaults to false, summary is null).
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Stays & itinerary");

  useEffect(() => {
    const load = async (id: string) => {
      await fetchTrip(id);
      await fetchByTrip(id);
      setInitialized(true);
    };

    if (tripId) {
      load(tripId);
    }
  }, [tripId]);

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  // Show loader until the first fetch resolves.
  if (!initialized || tripLoading || locationsLoading) {
    return (
      <Stack>
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

  // Only redirect after the fetch has completed and genuinely returned nothing.
  if (!currentTripSummary) {
    return <Navigate to="/trips" replace />;
  }

  const statusColor = getStatusColor(currentTripSummary.status ?? "planning");

  return (
    <Stack p={0}>
      <Breadcrumbs trip={currentTripSummary} tab={activeTab} />
      <Group justify="space-between">
        <Stack px="xl" pt="sm" w="100%">
          <Group>
            <Title fw="bold">{currentTripSummary.name}</Title>
            <Badge
              color={`${statusColor.color}.2`}
              c="var(--text-color)"
              bd={`2px solid ${statusColor.color}.6`}
              py="sm"
            >
              {currentTripSummary.status}
            </Badge>
          </Group>
          <Group gap={2} c="dimmed">
            <Text fz="sm">
              {!currentTripSummary.start_date || !currentTripSummary.end_date
                ? "Just created"
                : `${dayjs(currentTripSummary.start_date).format("D")} - ${dayjs(currentTripSummary.end_date).format("D MMM, YYYY")}`}
            </Text>
            <PiDotBold />
            {locations.length > 0 ? (
              <>
                <Text fz="sm">{`${locations.length} stays`}</Text>
                {currentTripSummary.start_date &&
                  currentTripSummary.end_date && (
                    <>
                      <PiDotBold />
                      <Text fz="sm">{`${calcNights(currentTripSummary.start_date, currentTripSummary.end_date)} nights`}</Text>
                    </>
                  )}
              </>
            ) : (
              <Text fz="sm">
                no locations yet - dates set once you add stays
              </Text>
            )}
          </Group>
          <Tabs value={activeTab}>
            <Tabs.List
              fw="bold"
              style={{ borderBottom: "2px solid var(--border-color)" }}
            >
              <Tabs.Tab
                value="Stays & itinerary"
                leftSection={<PiMapPin />}
                onClick={() => setActiveTab("Stays & itinerary")}
              >
                Stays & itinerary
              </Tabs.Tab>
              <Tabs.Tab
                value="Transport"
                leftSection={<PiPaperPlaneTilt />}
                onClick={() => setActiveTab("Transport")}
                disabled={locations.length === 0}
              >
                Transport
              </Tabs.Tab>
              <Tabs.Tab
                value="To-dos"
                leftSection={<PiCheckSquare />}
                onClick={() => setActiveTab("To-dos")}
                disabled={locations.length === 0}
              >
                To-dos
              </Tabs.Tab>
              <Tabs.Tab
                value="Budget"
                leftSection={<PiCreditCard />}
                onClick={() => setActiveTab("Budget")}
                disabled={locations.length === 0}
              >
                Budget
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="Stays & itinerary" p="xl">
              {locations.length === 0 ? (
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
                      Add your first location to start building the itinerary.
                      Stays, activities, transport and budget all hang off your
                      stops.
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
                <div>Hello</div>
              )}
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Group>
    </Stack>
  );
}
