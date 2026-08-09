import { Badge, Group, Stack, Text } from "@mantine/core";
import { useCurrencyStore } from "@/stores/currencyStore";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 52;
// Keep these in sync with TripCostPanel's transition durations, since the
// two panels are meant to expand/collapse together as one visual column.
const WIDTH_MS = 260;
const FADE_MS = 150;
const FADE_IN_DELAY_MS = 120;

interface LocationCostPanelProps {
  city: string;
  accommodationCost: number;
  activitiesCost: number;
  /**
   * Mirrors TripCostPanel's expanded state — passed down from the same
   * source, not owned here. This panel has no toggle of its own; only
   * TripCostPanel's header/collapsed strip controls the shared state.
   */
  expanded: boolean;
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

/**
 * Read-only per-location cost breakdown, stacked under TripCostPanel in the
 * trip layout's right column. It follows TripCostPanel's expanded state so
 * the two collapse/expand together, but is purely a follower — it renders no
 * clickable toggle of its own.
 */
export const LocationCostPanel = ({
  city,
  accommodationCost,
  activitiesCost,
  expanded,
}: LocationCostPanelProps) => {
  const currency = useCurrencyStore((s) => s.symbol);
  const format = (v: number) =>
    `${currency}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const stopTotal = accommodationCost + activitiesCost;

  return (
    <Stack
      component="aside"
      aria-label={`${city} cost breakdown`}
      gap={0}
      style={{
        boxShadow: `0 4px 0 var(--bg-secondary)`,
        width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        minWidth: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        alignSelf: "flex-start",
        borderRadius: "var(--mantine-radius-lg)",
        border: "2px solid var(--border-color)",
        background: "var(--surface-color)",
        transition: `width ${WIDTH_MS}ms cubic-bezier(0.4, 0, 0.2, 1), min-width ${WIDTH_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {/* ── Expanded content ─────────────────────────────────────── */}
      <Stack
        gap={0}
        style={{
          width: EXPANDED_WIDTH,
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? "auto" : "none",
          position: expanded ? "static" : "absolute",
          inset: 0,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: expanded ? `${FADE_IN_DELAY_MS}ms` : "0ms",
        }}
      >
        <Group
          justify="space-between"
          px="md"
          py="sm"
          style={{
            background: "var(--mantine-color-mint-4)",
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          <Text fw={800} size="sm" c="var(--border-color)">
            {city}
          </Text>
          <Badge variant="filled" color="mint.7" size="sm" radius="xl">
            This stop
          </Badge>
        </Group>

        <Stack gap="sm" p="md">
          <CostRow
            label="Accommodation"
            value={accommodationCost}
            format={format}
          />
          <CostRow label="Activities" value={activitiesCost} format={format} />
        </Stack>

        <Stack
          gap={4}
          px="md"
          pb="md"
          pt="sm"
          style={{ borderTop: "2px solid var(--border-color)" }}
        >
          <CostRow label="Stop total" value={stopTotal} format={format} bold />
        </Stack>
      </Stack>

      {/* ── Collapsed content ────────────────────────────────────── */}
      <Stack
        align="center"
        justify="flex-start"
        gap="sm"
        py="md"
        bg="mint.3"
        pos={expanded ? "absolute" : "static"}
        style={{
          width: COLLAPSED_WIDTH,
          opacity: expanded ? 0 : 1,
          pointerEvents: "none",
          inset: 0,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: expanded ? "0ms" : `${FADE_IN_DELAY_MS}ms`,
        }}
      >
        <Text
          size="sm"
          fw="bold"
          style={{
            writingMode: "vertical-rl",
            whiteSpace: "nowrap",
          }}
        >
          {`${city} · ${format(stopTotal)}`}
        </Text>
      </Stack>
    </Stack>
  );
};
