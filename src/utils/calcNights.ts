import dayjs from "dayjs";

export const calcNights = (start: string | null, end: string | null) => {
  if (!start || !end) {
    return 0;
  }
  return Math.ceil(dayjs(end).diff(dayjs(start), "days", true));
};
