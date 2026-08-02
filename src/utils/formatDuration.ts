/** Format minutes as a short label, e.g. 180 -> "3h", 90 -> "1h30m", 45 -> "45m". */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes == null || minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h${rest}m`;
};
