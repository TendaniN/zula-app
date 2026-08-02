import {
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Title,
  Text,
  Badge,
  Card,
} from "@mantine/core";
import { Link, Navigate, useParams } from "react-router-dom";
import { useActivityStore } from "@/stores/activityStore";
import { useEffect, useState } from "react";
import noActivitiesImg from "@/assets/icons/empty-itinerary.svg";
import { useLocationStore } from "@/stores/locationStore";
import { ActivityModal } from "./components/ActivityModal";
import { Button } from "@/components/ui";
import { PiArrowLeft, PiPlus } from "react-icons/pi";
import "./styles.scss";
import { getCountryFlag } from "@/utils/getCountryFlag";
import { calcNights } from "@/utils/calcNights";
import { ActivitiesPanel } from "./components/ActivitiesPanel";
import { CanEditTrip } from "@/components/auth";
import { formatDate } from "@/utils/date";

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

  const nights = calcNights(location.start_date, location.end_date);

  const infoLine = [
    location.start_date && location.end_date
      ? `${formatDate(location.start_date, "D")} – ${formatDate(location.end_date, "D MMM")}`
      : null,
    nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : null,
  ].join(" · ");

  return (
    <Stack p="lg" gap="lg" flex={1} miw={0}>
      <Group align="flex-start" gap="lg" wrap="nowrap" w="100%">
        <Stack gap="md" w="100%">
          <Group justify="space-between">
            <Link
              to={`/trips/${tripId}/Stays & itinerary`}
              className="back-button"
            >
              <PiArrowLeft />
              {location.country && getCountryFlag(location.country, 22)}
              <Text component="span" fw="bold">
                {location.city}
                {location.country ? `, ${location.country}` : ""}
              </Text>
            </Link>

            <Badge
              variant="filled"
              color="mint.3"
              c="var(--text-color)"
              bd="2px solid mint.5"
            >
              Itinerary
            </Badge>
          </Group>
          <Card p={0}>
            <Group
              justify="space-between"
              wrap="nowrap"
              p="md"
              bg="lavender.1"
              style={{
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <Text size="sm" c="dimmed" fw={500}>
                {infoLine || "Dates and stay details will show once set"}
              </Text>
              <CanEditTrip>
                <ActivityModal locationId={locationId} />
              </CanEditTrip>
            </Group>
            <ActivitiesPanel location={location} activities={activities} />
          </Card>
        </Stack>
      </Group>
    </Stack>
  );
}
