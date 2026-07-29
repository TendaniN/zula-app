import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Renders children only for app admins (unfiltered access across every
 * trip) — narrower than CanEditTrip, for admin-exclusive UI (e.g. a global
 * "manage all trips" panel) rather than per-trip edit controls.
 */
export const AdminOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const { isAdmin } = usePermissions();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};
