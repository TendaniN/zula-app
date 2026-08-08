import {
  Badge,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Breadcrumbs } from "../nav/Breadcrumbs";
import { useTripStore } from "@/stores/tripStore";
import { useLocationStore } from "@/stores/locationStore";
import {
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { getStatusColor } from "@/constants/status";
import { TripCostPanel } from "../ui/TripCostPanel";
import { calcNights } from "@/utils/calcNights";
import {
  PiCheckSquare,
  PiCreditCard,
  PiDotBold,
  PiMapPin,
  PiPaperPlaneTilt,
  PiDownloadSimpleBold,
} from "react-icons/pi";
import { useEffect, useState } from "react";
import { ViewOnlyBanner } from "../auth/ViewOnlyBanner";
import { LocationCostPanel } from "../ui/LocationCostPanel";
import { useActivityStore } from "@/stores/activityStore";
import { formatDate } from "@/utils/date";
import { ExportModal } from "../ExportModal";
import { Button } from "../ui";

export default function TripLayout() {
  const {
    currentTripSummary,
    fetchTrip,
    loading: tripLoading,
  } = useTripStore();
  const {
    locations,
    fetchByTrip,
    accommodationFor,
    loading: locationsLoading,
  } = useLocationStore();
  const byLocation = useActivityStore((s) => s.byLocation);
  const [searchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab");

  // Tracks whether the initial fetch has completed at least once.
  // Without this, the component redirects on refresh before the
  // fetch even starts (loading defaults to false, summary is null).
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab ?? "Stays & itinerary",
  );
  const [costPanelExpanded, setCostPanelExpanded] = useState(true);

  const navigate = useNavigate();
  const { tripId, locationId } = useParams();

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

  const activeLocation = locationId
    ? locations.find((l) => l.id === locationId)
    : undefined;
  const activeAccommodation = locationId
    ? accommodationFor(locationId)
    : undefined;

  const activeActivities = locationId ? byLocation(locationId) : [];

  const stopNights =
    activeLocation?.start_date && activeLocation?.end_date
      ? calcNights(activeLocation.start_date, activeLocation.end_date)
      : 0;
  const stopAccommodationCost = activeAccommodation
    ? activeAccommodation.cost_per_night * stopNights
    : 0;
  const stopActivitiesCost = activeActivities.reduce(
    (sum, a) => sum + (a.cost ?? 0),
    0,
  );

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    navigate(`/trips/${tripId}?tab=${tab}`);
  };

  return (
    <Stack p={0}>
      <Breadcrumbs trip={currentTripSummary} tab="Stays & itinerary" />
      <Group justify="space-between">
        <Stack px="xl" pt="sm" w="100%">
          <Group justify="space-between">
            <Group>
              <Title fw="bold">{currentTripSummary.name}</Title>
              <Badge
                color={`${statusColor.color}.2`}
                c="var(--border-color)"
                bd={`2px solid ${statusColor.color}.6`}
                py="sm"
              >
                {currentTripSummary.status}
              </Badge>
            </Group>
            <ExportModal
              trip={currentTripSummary}
              trigger={(open) => (
                <Button
                  variant="ghost"
                  leftSection={<PiDownloadSimpleBold />}
                  onClick={open}
                >
                  Export
                </Button>
              )}
            />
          </Group>
          <Group gap={2} c="dimmed">
            <Text fz="sm">
              {!currentTripSummary.start_date || !currentTripSummary.end_date
                ? "Just created"
                : `${formatDate(currentTripSummary.start_date, "D MMM")} - ${formatDate(currentTripSummary.end_date, "D MMM, YYYY")}`}
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
          <ViewOnlyBanner />
          <Tabs value={activeTab}>
            <Tabs.List
              fw="bold"
              style={{ borderBottom: "2px solid var(--border-color)" }}
            >
              <Tabs.Tab
                value="Stays & itinerary"
                leftSection={<PiMapPin />}
                onClick={() => handleTabSelect("Stays & itinerary")}
              >
                Stays & itinerary
              </Tabs.Tab>
              <Tabs.Tab
                value="Transport"
                leftSection={<PiPaperPlaneTilt />}
                onClick={() => handleTabSelect("Transport")}
                disabled={locations.length === 0}
              >
                Transport
              </Tabs.Tab>
              <Tabs.Tab
                value="To-dos"
                leftSection={<PiCheckSquare />}
                onClick={() => handleTabSelect("To-dos")}
                disabled={locations.length === 0}
              >
                To-dos
              </Tabs.Tab>
              <Tabs.Tab
                value="Budget"
                leftSection={<PiCreditCard />}
                onClick={() => handleTabSelect("Budget")}
                disabled={locations.length === 0}
              >
                Budget
              </Tabs.Tab>
            </Tabs.List>
            <ScrollArea
              h="calc(100dvh - 220px)"
              type="auto"
              offsetScrollbars
              classNames={{ scrollbar: "scrollbar", thumb: "thumb" }}
            >
              <Stack p="lg" gap="lg">
                <Group align="flex-start" gap="lg" wrap="nowrap">
                  <Outlet />

                  {locations.length > 0 && (
                    <Stack gap="lg" style={{ flexShrink: 0 }}>
                      <TripCostPanel
                        summary={currentTripSummary}
                        expanded={costPanelExpanded}
                        onToggle={() => setCostPanelExpanded((v) => !v)}
                      />
                      {activeLocation && (
                        <LocationCostPanel
                          city={activeLocation.city}
                          accommodationCost={stopAccommodationCost}
                          activitiesCost={stopActivitiesCost}
                          expanded={costPanelExpanded}
                        />
                      )}
                    </Stack>
                  )}
                </Group>
              </Stack>
            </ScrollArea>
          </Tabs>
        </Stack>
      </Group>
    </Stack>
  );
}
