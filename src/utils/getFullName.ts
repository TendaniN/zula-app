import type { Profile } from "@/types/models";

type ProfileLike =
  | Partial<Pick<Profile, "first_name" | "last_name" | "username" | "email">>
  | null
  | undefined;

export const getFullName = (profile: ProfileLike): string => {
  if (!profile) return "?";

  const first = profile.first_name?.trim();
  const last = profile.last_name?.trim();

  if (first && last) return `${first ?? ""} ${last ?? ""}`;

  if (profile.username) return profile.username;

  const localPart = profile.email?.split("@")[0];
  if (localPart) return localPart;

  return "?";
};
