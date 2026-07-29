import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Trip } from "@/types/models";
import { Flex, Group, Stack, Text } from "@mantine/core";
import { FaRegEye } from "react-icons/fa6";

interface ViewOnlyBannerProps {
  /** Trip to check against. Omit to use tripStore's currentTrip. */
  trip?: Trip | null;
  /** Rendered instead of children when the user lacks edit access. */
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has unfiltered editing access to
 * the trip — an app admin, or that trip's owner.
 */
export const ViewOnlyBanner = ({
  trip,
  fallback = null,
}: ViewOnlyBannerProps) => {
  const { canEdit } = usePermissions(trip);
  return !canEdit ? (
    <Group bdrs="lg" p="sm" bd="2px solid lavender.4" bg="var(--bg-secondary)">
      <Flex bg="lavender.3" bdrs="md" p="xs" bd="2px solid lavender.4">
        <FaRegEye />
      </Flex>
      <Stack gap={0}>
        <Text fw={800} size="sm">
          View-only access
        </Text>
        <Text size="xs" c="dimmed">
          You can browse this whole trip but can’t make changes. Ask the owner
          to invite you as an editor.
        </Text>
      </Stack>
    </Group>
  ) : (
    <>{fallback}</>
  );
};
