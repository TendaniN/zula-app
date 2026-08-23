import { useAuthStore } from "@/stores/authStore";
import { useTripStore } from "@/stores/tripStore";
import {
  isAdmin,
  isTripMember,
  isTripOwner,
  canEditTrip,
  canViewTrip,
} from "@/utils/permissions";
import type { Trip } from "@/types/models";

export interface UsePermissionsResult {
  /** App-wide admin — edits/views every trip. */
  isAdmin: boolean;
  /** Owns this specific trip. */
  isOwner: boolean;
  /** Has any access to this trip (owner or member). */
  isMember: boolean;
  /** May view the trip: any member, or an admin. Status-independent. */
  canView: boolean;
  /** May edit the trip in its CURRENT status (admin any time; owner unless
   *  the trip is completed; members never). This is what edit-gated UI uses. */
  canEdit: boolean;
}

/**
 * Resolves the current user's permissions for a trip.
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
  // trip — an explicitly-passed trip from elsewhere (e.g. a list card) has no
  // guarantee its members match whatever's currently loaded in the store.
  const members = trip ? undefined : currentMembers;

  return {
    isAdmin: isAdmin(profile),
    isOwner: isTripOwner(userId, targetTrip, members),
    isMember: isTripMember(userId, targetTrip, members),
    canView: canViewTrip(profile, userId, targetTrip, members),
    canEdit: canEditTrip(profile, userId, targetTrip, members),
  };
};
