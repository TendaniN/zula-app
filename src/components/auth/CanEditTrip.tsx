import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Trip } from "@/types/models";

interface CanEditTripProps {
  /** Trip to check against. Omit to use tripStore's currentTrip. */
  trip?: Trip | null;
  children: ReactNode;
  /** Rendered instead of children when the user can't edit. */
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user can edit the trip in its current
 * status. All the rules (admin any time, owner unless completed, members
 * never) live in canEditTrip via usePermissions — this component just gates
 * on the result, so it can't drift from the other consumers.
 */
export const CanEditTrip = ({
  trip,
  children,
  fallback = null,
}: CanEditTripProps) => {
  const { canEdit } = usePermissions(trip);
  return canEdit ? <>{children}</> : <>{fallback}</>;
};
