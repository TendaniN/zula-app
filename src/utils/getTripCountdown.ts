import dayjs from "dayjs";
export type TripCountdownPhase =
  "no-dates" | "upcoming" | "today" | "in-progress" | "ended";

export interface TripCountdown {
  phase: TripCountdownPhase;
  /** Whole days until the trip starts (0 on the start day, negative once begun). */
  daysUntilStart: number;
  /** Whole days until it ends (only meaningful while in-progress). */
  daysUntilEnd: number;
  /** For in-progress trips: which day of the trip it is (1-based). */
  dayOfTrip: number | null;
  /** Total trip length in days (inclusive of start & end), or null. */
  totalDays: number | null;
  /** Ready-to-render label, e.g. "32 days to go", "Today!", "Day 3 of 12". */
  label: string;
}

interface TripDates {
  start_date: string | null | undefined;
  end_date?: string | null | undefined;
}

export const getTripCountdown = (trip: TripDates): TripCountdown => {
  const empty: TripCountdown = {
    phase: "no-dates",
    daysUntilStart: 0,
    daysUntilEnd: 0,
    dayOfTrip: null,
    totalDays: null,
    label: "Add dates to start the countdown",
  };

  if (!trip.start_date) return empty;

  const today = dayjs().startOf("day");
  const start = dayjs(trip.start_date).startOf("day");
  if (!start.isValid()) return empty;

  const end = trip.end_date ? dayjs(trip.end_date).startOf("day") : null;
  const hasValidEnd = !!end && end.isValid();

  const daysUntilStart = start.diff(today, "day");
  const daysUntilEnd = hasValidEnd ? end.diff(today, "day") : 0;
  const totalDays = hasValidEnd && end ? end.diff(start, "day") + 1 : null; // inclusive

  // Before the trip starts.
  if (daysUntilStart > 0) {
    return {
      phase: "upcoming",
      daysUntilStart,
      daysUntilEnd,
      dayOfTrip: null,
      totalDays,
      label:
        daysUntilStart === 1 ? "Tomorrow!" : `${daysUntilStart} days to go`,
    };
  }

  // Starts today.
  if (daysUntilStart === 0) {
    return {
      phase: "today",
      daysUntilStart: 0,
      daysUntilEnd,
      dayOfTrip: hasValidEnd ? 1 : null,
      totalDays,
      label: "Today!",
    };
  }

  // Started already. If we know the end and haven't passed it → in progress.
  if (hasValidEnd && end && !today.isAfter(end)) {
    const dayOfTrip = today.diff(start, "day") + 1; // 1-based
    return {
      phase: "in-progress",
      daysUntilStart, // negative
      daysUntilEnd,
      dayOfTrip,
      totalDays,
      label: totalDays ? `Day ${dayOfTrip} of ${totalDays}` : "On your trip",
    };
  }

  // Ended (or started with no end date and the start is in the past).
  return {
    phase: "ended",
    daysUntilStart,
    daysUntilEnd,
    dayOfTrip: null,
    totalDays,
    label: "Trip complete",
  };
};
