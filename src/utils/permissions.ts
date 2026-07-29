import type { Profile, Trip, TripMember } from "@/types/models";

/**
 * True if the profile has unfiltered editing access across ALL trips.
 * Backed by profiles.app_role — set to "admin" for admin accounts.
 */
export const isAdmin = (profile: Profile | null | undefined): boolean =>
  profile?.app_role === "admin";

/**
 * True if the user has unfiltered editing access to THIS trip specifically,
 * because they own it. Checked two ways so it holds up regardless of which
 * data happens to be loaded:
 *   1. trips.owner_id === userId (the source of truth)
 *   2. a trip_members row for this user with role "owner" (covers cases
 *      where only membership data is available, e.g. a members list fetched
 *      without the parent trip row)
 */
export const isTripOwner = (
  userId: string | null | undefined,
  trip: Pick<Trip, "owner_id"> | null | undefined,
  members?: TripMember[] | null,
): boolean => {
  if (!userId) return false;
  if (trip?.owner_id === userId) return true;
  return (members ?? []).some(
    (m) => m.user_id === userId && m.role === "owner",
  );
};

/**
 * True if the user has unfiltered editing access to the given trip: either
 * an app admin (edits any trip) or that trip's owner (edits their own).
 * This is the one most call sites want — use isAdmin/isTripOwner directly
 * only when you need to distinguish *why* access was granted.
 */
export const canEditTrip = (
  profile: Profile | null | undefined,
  userId: string | null | undefined,
  trip: Pick<Trip, "owner_id"> | null | undefined,
  members?: TripMember[] | null,
): boolean => isAdmin(profile) || isTripOwner(userId, trip, members);
