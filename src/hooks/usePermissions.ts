import { useAuthStore } from "@/stores/authStore";
import { useTripStore } from "@/stores/tripStore";
import { isAdmin, isTripOwner } from "@/utils/permissions";
import type { Trip } from "@/types/models";

export interface UsePermissionsResult {
  /** App-wide admin — unfiltered editing access across every trip. */
  isAdmin: boolean;
  /** Owns this specific trip — unfiltered editing access to it. */
  isOwner: boolean;
  /** isAdmin || isOwner. What most call sites actually want to check. */
  canEdit: boolean;
}

/**
 * Resolves the current user's edit permissions for a trip.
 *
 * Pass a trip explicitly (e.g. from a TripCard in a list) or omit it to fall
 * back to tripStore's currentTrip/currentMembers (e.g. on a trip detail page
 * where the trip is already loaded into the store).
 */
export const usePermissions = (trip?: Trip | null): UsePermissionsResult => {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id);
  const currentTrip = useTripStore((s) => s.currentTrip);
  const currentMembers = useTripStore((s) => s.currentMembers);

  const targetTrip = trip ?? currentTrip;
  // Only fall back to store members when also falling back to the store's
  // trip — an explicitly-passed trip from elsewhere (e.g. a list card) has
  // no guarantee its members match whatever's currently loaded in the store.
  const members = trip ? undefined : currentMembers;

  const admin = isAdmin(profile);
  const owner = isTripOwner(userId, targetTrip, members);

  return {
    isAdmin: admin,
    isOwner: owner,
    canEdit: admin || owner,
  };
};
