import {
  Badge,
  Group,
  Skeleton,
  Menu,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineTheme,
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
import { FaPencil, FaRegTrashCan } from "react-icons/fa6";
import {
  PiCheckSquare,
  PiCreditCard,
  PiDotBold,
  PiMapPin,
  PiPaperPlaneTilt,
  PiDotsThreeBold,
} from "react-icons/pi";
import { useEffect, useState } from "react";
import { ViewOnlyBanner } from "../auth/ViewOnlyBanner";
import { LocationCostPanel } from "../ui/LocationCostPanel";
import { useActivityStore } from "@/stores/activityStore";
import { formatDate } from "@/utils/date";
import { ExportModal } from "../ExportModal";
import { IconButton, DeleteModal } from "../ui";
import { TripModal } from "@/pages/trip-list/components/TripModal";
import { CanEditTrip } from "../auth";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ShareModal } from "../ShareModal";
import { useAuthStore } from "@/stores/authStore";

export default function TripLayout() {
  const {
    currentTripSummary,
    currentTrip,
    fetchTrip,
    loading: tripLoading,
    deleteTrip,
    fetchMembers,
    currentMembers,
    currentInvites,
  } = useTripStore();
  const {
    locations,
    fetchByTrip,
    accommodationFor,
    loading: locationsLoading,
  } = useLocationStore();
  const currentUser = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const [searchParams] = useSearchParams();

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const DEFAULT_TAB = "Stays & itinerary";

  const TRIP_TABS_MAP = [
    {
      label: "Stays & itinerary",
      icon: <PiMapPin />,
    },
    {
      label: "Transport",
      icon: <PiPaperPlaneTilt />,
      disabled: locations.length === 0,
    },
    {
      label: "To-dos",
      icon: <PiCheckSquare />,
      disabled: locations.length === 0,
    },
    {
      label: "Budget",
      icon: <PiCreditCard />,
      disabled: locations.length === 0,
    },
  ];

  const defaultTab = searchParams.get("tab")
    ? TRIP_TABS_MAP.filter((t) => t.label === searchParams.get("tab")).length >
      0
      ? searchParams.get("tab")
      : DEFAULT_TAB
    : DEFAULT_TAB;

  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(defaultTab ?? DEFAULT_TAB);
  const [costPanelExpanded, setCostPanelExpanded] = useState(isSmallScreen);

  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const navigate = useNavigate();
  const { tripId, locationId } = useParams();

  useEffect(() => {
    const load = async (id: string) => {
      await fetchTrip(id);
      await fetchByTrip(id);
      await fetchMembers(id);
      setInitialized(true);
    };

    if (tripId) {
      load(tripId);
    }
  }, [tripId]);

  // Show loader until the first fetch resolves.
  if (!initialized || tripLoading || locationsLoading) {
    return (
      <Stack p={0}>
        {/* breadcrumbs */}
        <Skeleton height={14} width={220} radius="sm" mx="xl" mt="md" />

        <Stack px="xl" pt="sm" w="100%">
          {/* title + status badge, and the export/menu controls on the right */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Skeleton height={32} width={240} radius="sm" />
              <Skeleton height={24} width={80} radius="xl" />
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Skeleton height={32} width={90} radius="sm" />
              <Skeleton height={32} width={32} radius="sm" />
            </Group>
          </Group>

          {/* meta line (dates · stays · nights) */}
          <Skeleton height={14} width={280} radius="sm" />

          {/* tabs bar */}
          <Group
            gap="lg"
            wrap="nowrap"
            pb="sm"
            style={{ borderBottom: "2px solid var(--border-color)" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={`tab-skeleton-${i}`}
                height={20}
                width={110}
                radius="sm"
              />
            ))}
          </Group>

          {/* content area: main column + cost panel beside it */}
          <Group align="flex-start" gap="lg" wrap="nowrap" pt="lg">
            <Stack gap="lg" flex={1} miw={0}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`card-skeleton-${i}`} height={110} radius="lg" />
              ))}
            </Stack>

            <Skeleton
              height={260}
              width={300}
              radius="lg"
              visibleFrom="md"
              style={{ flexShrink: 0 }}
            />
          </Group>
        </Stack>
      </Stack>
    );
  }

  // Only redirect after the fetch has completed and genuinely returned nothing.
  if (!currentTripSummary || !currentTrip) {
    return <Navigate to="/trips" replace />;
  }

  const statusColor = getStatusColor(currentTripSummary.status ?? "planning");

  const activeLocation = locationId
    ? locations.find((l) => l.id === locationId)
    : undefined;
  const activeAccommodation = locationId
    ? accommodationFor(locationId)
    : undefined;

  const stopNights =
    activeLocation?.start_date && activeLocation?.end_date
      ? calcNights(activeLocation.start_date, activeLocation.end_date)
      : 0;
  const stopAccommodationCost = activeAccommodation
    ? activeAccommodation.cost_per_night * stopNights
    : 0;
  const stopActivitiesCost = activities.reduce(
    (sum, a) => sum + (a.cost ?? 0),
    0,
  );

  const handleTabSelect = (tab: string | null) => {
    if (tab) {
      setActiveTab(tab);
      navigate(`/trips/${tripId}?tab=${tab}`);
    }
  };

  const confirmDelete = async () => {
    await deleteTrip(currentTrip.id);
    closeDelete();
  };

  return (
    <Stack p={0} gap={0} h="100%" mih={0}>
      <Breadcrumbs trip={currentTripSummary} tab="Stays & itinerary" />

      <Stack px={{ base: "lg", sm: "xl" }} pt="sm" w="100%" mih={0} flex={1}>
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
          <Group>
            <CanEditTrip>
              <ShareModal
                trip={currentTrip}
                members={currentMembers}
                currentUserId={currentUser?.id}
                pendingInvites={currentInvites}
              />
            </CanEditTrip>

            <ExportModal trip={currentTripSummary} />
            <CanEditTrip>
              <Menu position="bottom-end" withinPortal shadow="md">
                <Menu.Target>
                  <IconButton
                    icon={<PiDotsThreeBold />}
                    variant="ghost"
                    size={isSmallScreen ? "md" : "lg"}
                    aria-label="Activity options"
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<FaPencil />}
                    onClick={() => openEdit()}
                  >
                    Edit trip
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<FaRegTrashCan />}
                    onClick={() => openDelete()}
                  >
                    Delete trip
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </CanEditTrip>
          </Group>
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
              {currentTripSummary.start_date && currentTripSummary.end_date && (
                <>
                  <PiDotBold />
                  <Text fz="sm">{`${calcNights(currentTripSummary.start_date, currentTripSummary.end_date)} nights`}</Text>
                </>
              )}
            </>
          ) : (
            <Text fz="sm">no locations yet - dates set once you add stays</Text>
          )}
        </Group>

        <ViewOnlyBanner />

        <Tabs
          value={activeTab}
          onChange={handleTabSelect}
          flex={1}
          mih={0}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tabs.List
            style={{ borderBottom: "2px solid var(--border-color)" }}
            data-tour="trip-tabs"
          >
            {TRIP_TABS_MAP.map(({ icon, label }) => (
              <Tabs.Tab key={`tab-${label}`} value={label} leftSection={icon}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <ScrollArea
            flex={1}
            mih={0}
            type="auto"
            offsetScrollbars
            classNames={{ scrollbar: "scrollbar", thumb: "thumb" }}
          >
            <Stack p={{ base: "xs", lg: "lg" }} gap="lg">
              <Group align="flex-start" gap="lg" wrap="nowrap">
                <Outlet />
                {locations.length > 0 && (
                  <Stack
                    gap="lg"
                    style={{ flexShrink: 0 }}
                    display={{ base: "none", sm: "flex" }}
                    component="aside"
                    aria-label="Trip costs"
                    data-tour="trip-cost"
                  >
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
      <TripModal trip={currentTrip} opened={editOpened} onClose={closeEdit} />
      <DeleteModal
        opened={deleteOpened}
        close={closeDelete}
        confirm={confirmDelete}
        item="trip"
        name={currentTrip.name}
      />
    </Stack>
  );
}
