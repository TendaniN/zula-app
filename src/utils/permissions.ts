import type { Profile, Trip, TripMember, TripStatus } from "@/types/models";

/**
 * True if the profile has unfiltered editing access across ALL trips.
 * Backed by profiles.app_role — set to "admin" for admin accounts.
 */
export const isAdmin = (profile: Profile | null | undefined): boolean =>
  profile?.app_role === "admin";

/**
 * True if the user owns THIS trip. Checked two ways so it holds regardless of
 * which data is loaded: trips.owner_id (source of truth), or a trip_members
 * row with role "owner" (when only the members list is available).
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
 * True if the user has ANY relationship to the trip — owner or member. This is
 * the "has the trip been shared with me / can I see it" check, so it counts the
 * owner as a member too (an owner is always a member of their own trip).
 */
export const isTripMember = (
  userId: string | null | undefined,
  trip: Pick<Trip, "owner_id"> | null | undefined,
  members?: TripMember[] | null,
): boolean => {
  if (!userId) return false;
  if (trip?.owner_id === userId) return true;
  return (members ?? []).some((m) => m.user_id === userId);
};

/**
 * Trip statuses where editing is locked to admins only. A "completed" trip is
 * a finished record — only a system admin can reopen or change it.
 *
 * "archived" is deliberately NOT here: an archived trip stays owner-editable
 * so the owner can un-archive/revive it. Add "archived" to this list if you'd
 * rather lock archived trips to admins too.
 */
const ADMIN_ONLY_EDIT_STATUSES: readonly TripStatus[] = ["completed"];

/**
 * Whether the user may edit the trip *in its current status* — the single
 * source of truth for edit permission:
 *   - admin              → any trip, any status
 *   - completed trip     → admin only (returns false for everyone else)
 *   - otherwise          → the trip owner
 * Members (non-owner) never get edit access.
 */
export const canEditTrip = (
  profile: Profile | null | undefined,
  userId: string | null | undefined,
  trip: Pick<Trip, "owner_id" | "status"> | null | undefined,
  members?: TripMember[] | null,
): boolean => {
  if (isAdmin(profile)) return true;
  const status = trip?.status ?? "planning";
  if (ADMIN_ONLY_EDIT_STATUSES.includes(status)) return false;
  return isTripOwner(userId, trip, members);
};

/**
 * Whether the user may view the trip at all: any member (owner or member) or
 * an admin. View access does NOT depend on status.
 */
export const canViewTrip = (
  profile: Profile | null | undefined,
  userId: string | null | undefined,
  trip: Pick<Trip, "owner_id"> | null | undefined,
  members?: TripMember[] | null,
): boolean => isAdmin(profile) || isTripMember(userId, trip, members);
