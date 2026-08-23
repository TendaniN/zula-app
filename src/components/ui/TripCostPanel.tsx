import { Badge, Divider, Group, Stack, Text } from "@mantine/core";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { TripSummaryRow } from "@/types/models";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 52;
// Keep these in sync with the transition durations below.
const WIDTH_MS = 260;
const FADE_MS = 150;
const FADE_IN_DELAY_MS = 120; // let the width shrink/grow before fading in

interface TripCostPanelProps {
  summary: TripSummaryRow;
  expanded: boolean;
  onToggle: () => void;
}

interface CostRowProps {
  label: string;
  value: number;
  format: (v: number) => string;
  bold?: boolean;
}

const CostRow = ({ label, value, format, bold }: CostRowProps) => (
  <Group justify="space-between">
    <Text
      size="sm"
      c={bold ? "var(--text-color)" : "dimmed"}
      fw={bold ? 700 : 500}
    >
      {label}
    </Text>
    <Text size={bold ? "lg" : "sm"} fw={bold ? 800 : 600} c="var(--text-color)">
      {format(value)}
    </Text>
  </Group>
);

export const TripCostPanel = ({
  summary,
  expanded,
  onToggle,
}: TripCostPanelProps) => {
  const currency = useCurrencyStore((s) => s.symbol);
  const format = (v: number) =>
    `${currency}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const accommodation = summary.accommodation_cost ?? 0;
  const activities = summary.activities_cost ?? 0;
  const travel = summary.travel_cost ?? 0;
  const total = summary.total_cost ?? 0;
  const buffer = summary.buffer_cost ?? 0;

  return (
    <Stack
      component="aside"
      aria-label="Trip cost"
      gap={0}
      w={expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
      miw={expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
      pos="relative"
      bdrs="lg"
      bd="2px solid var(--border-color)"
      bg="var(--surface-color)"
      style={{
        boxShadow: `0 4px 0 var(--bg-secondary)`,
        flexShrink: 0,
        overflow: "hidden",
        alignSelf: "flex-start",
        transition: `width ${WIDTH_MS}ms cubic-bezier(0.4, 0, 0.2, 1), min-width ${WIDTH_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {/* ── Expanded content ─────────────────────────────────────── */}
      <Stack
        gap="md"
        w={EXPANDED_WIDTH}
        opacity={expanded ? 1 : 0}
        pos={expanded ? "static" : "absolute"}
        style={{
          pointerEvents: expanded ? "auto" : "none",
          inset: 0,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: expanded ? `${FADE_IN_DELAY_MS}ms` : "0ms",
        }}
      >
        <Group
          justify="space-between"
          p="md"
          onClick={onToggle}
          role="button"
          tabIndex={expanded ? 0 : -1}
          onKeyDown={(e) => e.key === "Enter" && onToggle()}
          style={{
            cursor: "pointer",
            borderBottom: "2px solid var(--border-color)",
            backgroundColor:
              "light-dark(var(--mantine-primary-color-1), var(--mantine-color-dark-9))",
          }}
        >
          <Group gap={6}>
            <LuChevronRight />
            <Text fw="bold" size="sm">
              Trip cost
            </Text>
          </Group>
          <Badge
            variant="transparent"
            size="sm"
            bd="2px solid var(--border-color)"
            styles={{ label: { fontWeight: 700 } }}
          >
            Read-only
          </Badge>
        </Group>

        <Stack gap="sm" p="md">
          <CostRow
            label="Accommodation"
            value={accommodation}
            format={format}
          />
          <CostRow label="Activities" value={activities} format={format} />
          <CostRow label="Transport" value={travel} format={format} />
          <CostRow label="Buffer" value={buffer} format={format} />
        </Stack>

        <Stack gap={4} px="md" pt={0} pb="md">
          <Divider px="md" pb="md" color="var(--border-color)" />
          <CostRow label="Trip total" value={total} format={format} bold />
        </Stack>
      </Stack>

      {/* ── Collapsed content ────────────────────────────────────── */}
      <Stack
        align="center"
        justify="flex-start"
        gap="sm"
        py="md"
        onClick={onToggle}
        role="button"
        tabIndex={expanded ? -1 : 0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        h="100%"
        w={COLLAPSED_WIDTH}
        opacity={expanded ? 0 : 1}
        pos={expanded ? "absolute" : "static"}
        style={{
          backgroundColor:
            "light-dark(var(--mantine-primary-color-1), var(--mantine-color-dark-9))",
          cursor: "pointer",
          pointerEvents: expanded ? "none" : "auto",
          inset: 0,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: expanded ? "0ms" : `${FADE_IN_DELAY_MS}ms`,
        }}
      >
        <LuChevronLeft />
        <Text
          size="sm"
          fw="bold"
          style={{
            writingMode: "vertical-rl",
            whiteSpace: "nowrap",
          }}
        >
          {`Trip cost · ${format(total)}`}
        </Text>
      </Stack>
    </Stack>
  );
};
