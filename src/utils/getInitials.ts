import type { Profile } from "@/types/models";

/**
 * Derive up-to-two-character initials from a profile, in priority order:
 *   1. first + last name  → "Mia Chen"        → "MC"
 *   2. first name only     → "Mia"             → "MI"  (or "M" if 1 char)
 *   3. username            → "mia_chen" / "mia" → "MC" / "MI"
 *   4. email local-part    → "mia.chen@x.com"  → "MC"
 *   5. fallback            →                    → "?"
 *
 * Accepts a full Profile or just the loose fields, so it works with partial
 * shapes (e.g. a members row that only carries some columns).
 */
type ProfileLike =
  | Partial<Pick<Profile, "first_name" | "last_name" | "username" | "email">>
  | null
  | undefined;

/** Uppercase first char of a string, or "" if there's nothing usable. */
const firstChar = (value: string | null | undefined): string =>
  value?.trim()?.[0]?.toUpperCase() ?? "";

/**
 * Two initials from a single string by splitting on spaces or common
 * separators (used for usernames / email local-parts like "mia_chen").
 */
const initialsFromToken = (value: string | null | undefined): string => {
  const cleaned = value?.trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return firstChar(parts[0]) + firstChar(parts[1]) || "";
  }
  // Single token: take its first two letters ("mia" → "MI").
  return cleaned.slice(0, 2).toUpperCase();
};

export const getInitials = (profile: ProfileLike): string => {
  if (!profile) return "?";

  const first = profile.first_name?.trim();
  const last = profile.last_name?.trim();

  if (first && last) return firstChar(first) + firstChar(last);

  // First name only (two letters if available, so "Mia" → "MI" not "M").
  if (first) return first.slice(0, 2).toUpperCase();

  const fromUsername = initialsFromToken(profile.username);
  if (fromUsername) return fromUsername;

  // Email local-part.
  const localPart = profile.email?.split("@")[0];
  const fromEmail = initialsFromToken(localPart);
  if (fromEmail) return fromEmail;

  return "?";
};
