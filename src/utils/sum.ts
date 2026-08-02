export const sum = (items: number[]) => {
  return (
    Math.round(items.reduce((partialSum, a) => partialSum + a, 0) * 100) / 100
  );
};

import dayjs from "dayjs";
import { calcNights } from "./calcNights";

export const workingSumDays = (start: string, end: string) => {
  let count = 0;
  let daysRemaining = calcNights(start, end);
  let newDate = dayjs(start).clone();
  while (daysRemaining > -1) {
    if (newDate.day() !== 0 && newDate.day() !== 6) {
      count += 1;
    }
    newDate = newDate.add(1, "day");
    daysRemaining -= 1;
  }
  return count;
};
