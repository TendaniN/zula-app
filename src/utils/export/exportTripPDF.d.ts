import type { TripSummary } from "@/types/database";

declare module "./exportTripPDF" {
  export function exportTripPDF(
    trip: TripSummary & { start_date: string; end_date: string },
  ): void;
}
