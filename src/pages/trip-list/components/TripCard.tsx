import { getStatusColor } from "@/constants/status";
import type { TripSummaryRow } from "@/types/models";
import {
  Badge,
  Card,
  Flex,
  Group,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { PiDotBold } from "react-icons/pi";
import { getCountryFlag } from "@/utils/getCountryFlag";
import { calcNights } from "@/utils/calcNights";
import { useCurrencyStore } from "@/stores/currencyStore";
import { Link } from "react-router-dom";
import { formatDate } from "@/utils/date";

const GRADIENT_COLORS = ["aurora", "bloom", "meadow", "seaform"] as const;

interface TripCardProps {
  trip: TripSummaryRow;
  index: number;
}

export const TripCard = ({ trip, index }: TripCardProps) => {
  const statusColor = getStatusColor(trip.status ?? "planning");
  const currency = useCurrencyStore((s) => s.symbol);
  return (
    <Card
      p={0}
      component={Link}
      to={`/trips/${trip.id}?tab=${encodeURIComponent("Stays & itinerary")}`}
    >
      <Stack>
        <Flex
          bg={`var(--${GRADIENT_COLORS[index % GRADIENT_COLORS.length]})`}
          p="2.5rem"
          pos="relative"
        >
          <Badge
            color={`${statusColor.color}.2`}
            c="var(--border-color)"
            bd={`2px solid ${statusColor.color}.6`}
            tt="capitalize"
            py="sm"
            pos="absolute"
            top="1rem"
            right="1rem"
          >
            {trip.status}
          </Badge>
        </Flex>
        <Group mt={-28} mx="sm" gap="xs" style={{ zIndex: 1 }}>
          {trip.countries?.map((country) => getCountryFlag(country))}
        </Group>
        <Text fz="md" fw="bold" px="sm">
          {trip.name}
        </Text>
        {trip.start_date && trip.end_date && (
          <Group gap={2} c="dimmed" mx="sm">
            <Text fz="sm">{`${formatDate(trip.start_date, "D")} - ${formatDate(trip.end_date, "D MMM YYYY")}`}</Text>
            <PiDotBold />
            <Text fz="sm">{`${calcNights(trip.start_date, trip.end_date)} nights`}</Text>
          </Group>
        )}
        <Group
          mx="sm"
          style={{ borderTop: "1px dashed var(--border-color)" }}
          py="md"
          justify="space-between"
        >
          <Text c="dimmed">Total</Text>
          <Text fw="bold">
            <NumberFormatter
              prefix={`${currency} `}
              value={trip.total_cost ?? 0}
              thousandSeparator
            />
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};
