import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  PiHouseLineBold,
  PiCalendarDotBold,
  PiPaperPlaneTiltBold,
  PiShieldBold,
} from "react-icons/pi";

import { LuMinus, LuPlus } from "react-icons/lu";
import { IconButton } from "@/components/ui";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { TripSummaryRow } from "@/types/models";
import { useLocationStore } from "@/stores/locationStore";
import { useTransportStore } from "@/stores/transportStore";
import dayjs from "dayjs";
import { useActivityStore } from "@/stores/activityStore";
import { useBudgetStore } from "@/stores/budgetStore";
import type { BudgetMonths } from "@/constants/budget";

interface BudgetPanelProps {
  currentTripSummary: TripSummaryRow;
}

interface CategoryConfig {
  key: keyof BudgetMonths;
  label: string;
  color: string;
  icon: React.ReactNode;
  cost: number;
  type: string;
}

const MIN_MONTHS = 1;
const MAX_MONTHS = 24;

export const BudgetPanel = ({ currentTripSummary }: BudgetPanelProps) => {
  const currency = useCurrencyStore((s) => s.symbol);
  const locations = useLocationStore((s) => s.locations);
  const locationCount = locations.length;
  const { transports, fetchByTrip } = useTransportStore();
  const transportCount = transports.length;
  const { activities: locActivities, fetchByLocations } = useActivityStore();
  const activityCount = locActivities.length;
  const { months, fetchByTrip: fetchBudget, adjustMonth } = useBudgetStore();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const load = async (ids: string[], tripId: string | null) => {
      await fetchByLocations(ids);
      if (tripId) {
        await fetchByTrip(tripId);
        await fetchBudget(tripId);
      }
      setInitialized(true);
    };

    load(
      locations.map((s) => s.id),
      currentTripSummary.id,
    );
  }, [locations, currentTripSummary]);

  if (!initialized) {
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

  const handleAdjust = (key: keyof BudgetMonths, delta: number) => {
    if (currentTripSummary.id) adjustMonth(currentTripSummary.id, key, delta);
  };

  const {
    accommodation_cost,
    activities_cost,
    travel_cost,
    buffer_cost,
    total_cost,
    start_date,
  } = currentTripSummary;

  const accommodation = accommodation_cost ?? 0;
  const activities = activities_cost ?? 0;
  const transport = travel_cost ?? 0;
  const buffer = buffer_cost ?? 0;
  const total = total_cost ?? 0;

  const format = (v: number) => `${currency}${Math.round(v).toLocaleString()}`;

  const categories: CategoryConfig[] = [
    {
      key: "accommodation",
      label: "Accommodation",
      color: "lavender",
      icon: <PiHouseLineBold />,
      cost: accommodation,
      type:
        locationCount != null
          ? `${locationCount} ${locationCount === 1 ? "stay" : "stays"}`
          : "—",
    },
    {
      key: "activities",
      label: "Itinerary activities",
      color: "mint",
      icon: <PiCalendarDotBold />,
      cost: activities,
      type:
        activityCount != null
          ? `${activityCount} ${activityCount === 1 ? "activity" : "activities"}`
          : "—",
    },
    {
      key: "transport",
      label: "Transport",
      color: "peach",
      icon: <PiPaperPlaneTiltBold />,
      cost: transport,
      type:
        transportCount != null
          ? `${transportCount} ${transportCount === 1 ? "leg" : "legs"}`
          : "—",
    },
    {
      key: "buffer",
      label: "Buffer",
      color: "pink",
      icon: <PiShieldBold />,
      cost: buffer,
      type: "Emergencies",
    },
  ];

  const monthlyFor = (cost: number, key: keyof BudgetMonths) =>
    months[key] > 0 ? Math.round(cost / months[key]) : 0;

  const monthlyTotal = categories.reduce(
    (sum, c) => sum + monthlyFor(c.cost, c.key),
    0,
  );

  const monthsSavedFor = (key: keyof BudgetMonths): number => {
    if (!start_date) return 0;
    const savingWindowOpens = dayjs(start_date).subtract(months[key], "month");
    const elapsed = dayjs().diff(savingWindowOpens, "month");
    return Math.min(Math.max(elapsed, 0), months[key]);
  };

  const amountSaved = categories.reduce(
    (sum, c) =>
      sum + Math.min(monthlyFor(c.cost, c.key) * monthsSavedFor(c.key), c.cost),
    0,
  );

  const savedPct =
    total > 0 ? Math.min(100, Math.round((amountSaved / total) * 100)) : 0;
  const remaining = Math.max(0, total - amountSaved);

  return (
    <Stack gap="md" flex={1} miw={0}>
      {/* Header */}
      <Stack gap={2}>
        <Text fw={800} size="lg">
          Savings plan
        </Text>
        <Text size="sm" c="dimmed">
          {`Set a savings window per category · save ${format(monthlyTotal)} / month to be ready`}
        </Text>
      </Stack>

      {/* Total budget banner */}
      <Card
        p="lg"
        bg="lavender.6"
        display="flex"
        shadow="sm"
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Stack gap={4}>
          <Text
            size="xs"
            fw={800}
            tt="uppercase"
            c="var(--mantine-color-lavender-0)"
          >
            Total budget
          </Text>
          <Text size="1.75rem" fw={800} c="white">
            {format(total)}
          </Text>
        </Stack>
        <Text
          my="auto"
          size="sm"
          fw={600}
          c="var(--mantine-color-lavender-0)"
          ta="right"
        >
          {`≈ ${format(monthlyTotal)}`}
          <br />/ month
        </Text>
      </Card>

      {/* Category cards */}
      <SimpleGrid cols={2} spacing="md">
        {categories.map((c) => {
          const pct = total > 0 ? Math.round((c.cost / total) * 100) : 0;
          return (
            <Card
              key={c.key}
              display="flex"
              shadow="sm"
              p="md"
              style={{
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: "0.5rem",
              }}
            >
              <ThemeIcon
                bd={`2px solid ${c.color}.5`}
                color={`${c.color}.1`}
                c="var(--border-color)"
                radius="md"
                size="xl"
              >
                {c.icon}
              </ThemeIcon>
              <Stack gap={0}>
                <Group>
                  <Text size="xs" c="dimmed" fw={700}>
                    {c.label}
                  </Text>
                  <Text size="xs" c="dimmed" fw={700}>
                    {pct}%
                  </Text>
                </Group>

                <Text fw={800} size="md">
                  {format(c.cost)}
                </Text>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Composition bar */}
      <Progress.Root size={20} radius="xl" bd="2px solid var(--border-color)">
        {categories.map((c) => {
          const pct = total > 0 ? (c.cost / total) * 100 : 0;
          return pct > 0 ? (
            <Progress.Section
              key={c.key}
              value={pct}
              color={c.color}
              aria-label={`${c.label} ${Math.round(pct)}%`}
            />
          ) : null;
        })}
      </Progress.Root>

      {/* Category / timespan table */}
      <Card p={0} shadow="sm">
        <Group
          justify="space-between"
          c="dimmed"
          tt="uppercase"
          gap={0}
          p="sm"
          style={{ borderBottom: "2px solid var(--border-color)" }}
        >
          <Text size="xs" fw={700} flex={1 / 5}>
            Category
          </Text>
          <Text size="xs" fw={700} flex={1 / 5}>
            Type
          </Text>
          <Text size="xs" fw={700} flex={1 / 5}>
            Cost
          </Text>
          <Text size="xs" fw={700} ta="center" flex={1 / 5}>
            Timespan
          </Text>
          <Text size="xs" fw={700} ta="right" flex={1 / 5}>
            Monthly
          </Text>
        </Group>
        {categories.map((c) => (
          <Group
            key={c.key}
            p="sm"
            gap={0}
            justify="space-between"
            style={{ borderBottom: "2px solid var(--border-color)" }}
          >
            <Group gap="xs" wrap="nowrap" flex={1 / 5}>
              <Box
                w={10}
                h={10}
                bdrs="xl"
                bg={`${c.color}.5`}
                style={{
                  flexShrink: 0,
                }}
              />
              <Text fw={700} size="sm">
                {c.label}
              </Text>
            </Group>
            <Text size="sm" c="dimmed" flex={1 / 5}>
              {c.type}
            </Text>
            <Text size="sm" fw={600} flex={1 / 5}>
              {format(c.cost)}
            </Text>
            <Group gap="xs" justify="center" wrap="nowrap" flex={1 / 5}>
              <IconButton
                icon={<LuMinus />}
                variant="ghost"
                size="xs"
                aria-label={`Decrease ${c.label} timespan`}
                disabled={months[c.key] <= MIN_MONTHS}
                onClick={() => handleAdjust(c.key, -1)}
              />
              <Text size="sm" fw={600} miw={64} ta="center">
                {`${months[c.key]} ${months[c.key] === 1 ? "month" : "months"}`}
              </Text>
              <IconButton
                icon={<LuPlus />}
                variant="ghost"
                size="xs"
                aria-label={`Increase ${c.label} timespan`}
                disabled={months[c.key] >= MAX_MONTHS}
                onClick={() => handleAdjust(c.key, 1)}
              />
            </Group>
            <Text size="sm" fw={700} ta="right" flex={1 / 5}>
              {format(monthlyFor(c.cost, c.key))}
            </Text>
          </Group>
        ))}
        <Group p="sm" justify="space-between" gap={0}>
          <Text fw={800} size="sm" flex={1 / 5}>
            Budget total
          </Text>
          <Text size="sm" c="dimmed" flex={1 / 5}>
            —
          </Text>
          <Text fw={800} size="sm" flex={1 / 5}>
            {format(total)}
          </Text>
          <Text size="sm" c="dimmed" flex={1 / 5} ta="center">
            —
          </Text>
          <Text fw={800} size="sm" c="lavender.7" ta="right" flex={1 / 5}>
            {format(monthlyTotal)}
          </Text>
        </Group>
      </Card>

      {/* Saved progress */}
      <Group wrap="nowrap" gap="md" align="center">
        <Progress.Root
          size={16}
          radius="xl"
          bd="2px solid var(--border-color)"
          style={{ flex: 1 }}
        >
          <Progress.Section
            value={savedPct}
            bdrs="xl"
            styles={{
              section: {
                background: "var(--aurora)",
              },
            }}
          />
        </Progress.Root>
        <Group>
          <Text
            size="sm"
            fw={700}
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
          >
            {`${savedPct}% saved`}
          </Text>
          <Text
            size="sm"
            c="dimmed"
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Saved{" "}
            <Text fw="bold" component="span" c="var(--text-color)">
              {format(amountSaved)}
            </Text>{" "}
            · Remaining{" "}
            <Text fw="bold" component="span" c="var(--text-color)">
              {format(remaining)}
            </Text>
          </Text>
        </Group>
      </Group>
    </Stack>
  );
};
