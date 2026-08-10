import type { ReactNode } from "react";
import dayjs from "dayjs";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { PiPaperPlaneTiltBold, PiLockBold, PiEyeBold } from "react-icons/pi";
import { Navigate } from "react-router-dom";

import { usePermissions } from "@/hooks/usePermissions";
import { useTripStore } from "@/stores/tripStore";
import type { Trip, TripStatus } from "@/types/models";

interface ViewOnlyBannerProps {
  /** Trip to check against. Omit to use tripStore's currentTrip. */
  trip?: Trip | null;
  /** Rendered when the user CAN edit (i.e. no banner needed). */
  fallback?: ReactNode;
}

interface BannerVariant {
  /** Mantine palette name driving the border / background / icon tile. */
  color: string;
  icon: ReactNode;
  title: string;
  body: ReactNode;
}

/**
 * Shows a status-aware "view-only" notice when the user can see the trip but
 * not edit it. Editable → renders `fallback`; no view access → redirects to
 * /trips (a secondary guard behind RLS + the layout's own redirect).
 */
export const ViewOnlyBanner = ({
  trip,
  fallback = null,
}: ViewOnlyBannerProps) => {
  const { canEdit, canView } = usePermissions(trip);
  const currentTrip = useTripStore((s) => s.currentTrip);
  const currentMembers = useTripStore((s) => s.currentMembers);

  if (canEdit) return <>{fallback}</>;
  if (!canView) return <Navigate to="/trips" replace />;

  const resolved = trip ?? currentTrip;
  const status: TripStatus = resolved?.status ?? "planning";

  // Owner's display name for the active-trip copy, from the loaded members.
  const ownerMember = currentMembers.find((m) => m.role === "owner");
  const ownerName = ownerMember?.profile
    ? `${ownerMember.profile.first_name} ${ownerMember.profile.last_name}`.trim()
    : "the trip owner";

  const startDate = resolved?.start_date
    ? dayjs(resolved.start_date).format("MMM D")
    : null;

  let variant: BannerVariant;

  if (status === "active") {
    variant = {
      color: "mint",
      icon: <PiPaperPlaneTiltBold />,
      title: "Trip is under way · owner edits only",
      body: (
        <>
          {startDate ? `This trip started ${startDate} - ` : ""}while it’s
          active only {ownerName} (trip owner) or a Zula admin can change stays,
          plans, transport and budget. Everyone else keeps full view access.
        </>
      ),
    };
  } else if (status === "completed") {
    variant = {
      color: "peach",
      icon: <PiLockBold />,
      title: "Trip completed · locked for editing",
      body: "Completed trips stay locked so the record isn’t changed by accident. If you’re an admin - reopen it from trip settings to make edits.",
    };
  } else {
    // planning / archived — a member viewing a trip they can't edit.
    variant = {
      color: "lavender",
      icon: <PiEyeBold />,
      title: "View-only access",
      body: "You can browse this whole trip but can’t make changes. Ask the owner to invite you as an editor.",
    };
  }

  return (
    <Group
      wrap="nowrap"
      align="center"
      p="md"
      bdrs="lg"
      bd={`2px solid ${variant.color}`}
      style={{
        backgroundColor: `light-dark(var(--mantine-color-${variant.color}-0), var(--mantine-color-${variant.color}-9))`,
      }}
    >
      <ThemeIcon
        p="sm"
        bdrs="md"
        size="xl"
        bd={`2px solid ${variant.color}.5`}
        c="var(--border-color)"
        color={`${variant.color}.3`}
        style={{
          flexShrink: 0,
        }}
      >
        {variant.icon}
      </ThemeIcon>
      <Stack gap={2}>
        <Text fw={800} size="sm" c="var(--text-color)">
          {variant.title}
        </Text>
        <Text size="xs" c="dimmed">
          {variant.body}
        </Text>
      </Stack>
    </Group>
  );
};
