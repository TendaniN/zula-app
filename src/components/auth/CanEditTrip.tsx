import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Trip } from "@/types/models";

interface CanEditTripProps {
  /** Trip to check against. Omit to use tripStore's currentTrip. */
  trip?: Trip | null;
  children: ReactNode;
  /** Rendered instead of children when the user lacks edit access. */
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has unfiltered editing access to
 * the trip — an app admin, or that trip's owner.
 */
export const CanEditTrip = ({
  trip,
  children,
  fallback = null,
}: CanEditTripProps) => {
  const { canEdit } = usePermissions(trip);
  return canEdit ? <>{children}</> : <>{fallback}</>;
};
