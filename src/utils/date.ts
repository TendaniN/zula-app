import dayjs from "dayjs";

export const formatDate = (
  value: Date | string | null,
  format = "YYYY-MM-DD",
  iso = false,
): string | null => {
  if (iso) {
    return value ? dayjs(value).toISOString() : null;
  }
  return value ? dayjs(value).format(format) : null;
};

export const translateDate = (
  s: string | null | undefined,
  format = "YYYY-MM-DD",
  iso = false,
): Date | null => {
  if (iso) {
    return s ? dayjs(s, format).toDate() : null;
  }
  return s ? dayjs(s).toDate() : null;
};
