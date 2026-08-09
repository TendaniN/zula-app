import ExcelJS from "exceljs";
import dayjs from "dayjs";
import { sum, workingSumDays } from "../sum";
import type { Location, TripSummaryRow } from "@/types/models";
import { useLocationStore } from "@/stores/locationStore";
import { calcNights } from "../calcNights";
import { useActivityStore } from "@/stores/activityStore";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useTransportStore } from "@/stores/transportStore";
import { formatDuration } from "../formatDuration";
import { DEFAULT_BUDGET_MONTHS, type BudgetMonths } from "@/constants/budget";

/**
 * exportTripXLSX — ExcelJS edition.
 *
 * Ported from the old SheetJS (`xlsx`) implementation, which is no longer
 * maintained. Behaviour is preserved: four sheet types (Summary, one itinerary
 * sheet per location, Budget Planning, Transport) and the same monthly-budget
 * split. ExcelJS is async and writes a Buffer, so in the browser we turn that
 * into a Blob and trigger a download via an anchor element (there is no
 * `XLSX.writeFile` equivalent client-side).
 *
 * All numeric/string fields on TripSummaryRow are nullable — it's a
 * PostgREST view, so every column comes back `T | null` regardless of the
 * underlying table's constraints. Every usage below coalesces accordingly.
 */

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF0F0F0" },
};

const styleHeaderRow = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
};

const centerColumnsFrom = (ws: ExcelJS.Worksheet, startCol: number) => {
  ws.columns.forEach((col, i) => {
    if (i >= startCol - 1 && col) {
      col.alignment = { horizontal: "center", vertical: "middle" };
    }
  });
};

// ---------------------------------------------------------------------------
// Summary sheet
// ---------------------------------------------------------------------------
const summarySheet = (
  locations: Location[],
  trip: TripSummaryRow & { start_date: string; end_date: string },
  workbook: ExcelJS.Workbook,
) => {
  const ws = workbook.addWorksheet("Summary");

  ws.columns = [
    { header: "Country", key: "country", width: 22 },
    { header: "Location", key: "location", width: 22 },
    { header: "Arrive", key: "arrive", width: 16 },
    { header: "Depart", key: "depart", width: 16 },
    { header: "Nights", key: "nights", width: 10 },
  ];
  styleHeaderRow(ws.getRow(1));

  [...locations]
    .sort(
      (a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf(),
    )
    .forEach((location) => {
      ws.addRow({
        country: location.country,
        location: location.city,
        arrive: location.start_date,
        depart: location.end_date,
        nights: calcNights(location.start_date, location.end_date),
      });
    });

  ws.addRow({});
  ws.addRow({
    country: "Total number of nights",
    location: calcNights(trip.start_date, trip.end_date),
  });
  ws.addRow({
    country: "Total number of working days",
    location: workingSumDays(trip.start_date, trip.end_date),
  });
};

// ---------------------------------------------------------------------------
// Per-location itinerary sheet
// ---------------------------------------------------------------------------
const locationSheet = (
  location: Location,
  workbook: ExcelJS.Workbook,
  includeActivities = false,
) => {
  const currency = useCurrencyStore.getState().symbol;
  const ws = workbook.addWorksheet(`${location.city} Itinerary`);

  // Accommodation now lives in its own table (accommodations, 1:0..1 with
  // locations) — there's no accommodation_name column on Location anymore.
  // Look it up via the store instead of reading a field that no longer exists.
  const accommodation = useLocationStore
    .getState()
    .accommodationFor(location.id);

  ws.addRow(["City", location.city]);
  ws.addRow(["Arrive", dayjs(location.start_date).format("ddd, DD MMMM YYYY")]);
  ws.addRow(["Depart", dayjs(location.end_date).format("ddd, DD MMMM YYYY")]);
  ws.addRow(["Nights", calcNights(location.start_date, location.end_date)]);
  ws.addRow(["Hotel", accommodation?.name ?? ""]);
  ws.getColumn(1).font = { bold: true };
  ws.getColumn(1).width = 14;

  if (!includeActivities) return;

  // byLocation is the store's own selector for this — avoids duplicating
  // the filter logic (and staying in sync if the store's internal shape
  // ever changes).
  const activities = useActivityStore.getState().byLocation(location.id);

  ws.addRow([]);
  ws.addRow(["Itinerary"]);
  const headerRow = ws.addRow([
    "",
    "Date",
    "Activity",
    "Time",
    `Cost (in ${currency})`,
    "Duration (in hrs)",
    "Link",
  ]);
  styleHeaderRow(headerRow);

  activities
    .sort(
      (a, b) =>
        dayjs(a.activity_date).valueOf() - dayjs(b.activity_date).valueOf(),
    )
    .forEach((activity, index) => {
      const row = ws.addRow([
        index + 1,
        dayjs(activity.activity_date).format("ddd, DD MMMM YYYY"),
        activity.name,
        activity.activity_time,
        activity.cost,
        formatDuration(activity.duration_minutes),
        activity.link ?? "",
      ]);
      if (activity.link) {
        const linkCell = row.getCell(7);
        linkCell.value = { text: "link", hyperlink: activity.link };
        linkCell.font = { color: { argb: "FF0000FF" }, underline: true };
      }
    });

  // widen the activity columns a touch
  ws.getColumn(2).width = 24;
  ws.getColumn(3).width = 32;
  ws.getColumn(5).width = 16;
  ws.getColumn(6).width = 16;
};

// ---------------------------------------------------------------------------
// Budget sheet — mirrors BudgetPanel exactly:
//   - each category has its OWN timespan (months), not one shared
//     "now → departure" span with hardcoded per-category offsets
//   - monthly = cost / that category's own timespan
//   - "saved so far" comes from a savings window that opens `timespan`
//     months before departure (not from when the trip was created) —
//     shorter-timespan categories start saving later, longer ones earlier,
//     all counting back from the same start_date
//   - all four categories always appear, regardless of cost (the old
//     `if (cost > 0)` guards are gone — BudgetPanel doesn't hide zero-cost
//     categories either)
// ---------------------------------------------------------------------------
const budgetSheet = (
  trip: TripSummaryRow & { start_date: string; end_date: string },
  workbook: ExcelJS.Workbook,
  months: BudgetMonths = DEFAULT_BUDGET_MONTHS,
) => {
  const currency = useCurrencyStore.getState().symbol;
  const ws = workbook.addWorksheet("Budget Planning");

  ws.columns = [
    { header: "Category", key: "name", width: 24 },
    { header: "Type", key: "type", width: 16 },
    { header: "Cost", key: "cost", width: 16 },
    { header: "Timespan", key: "timespan", width: 16 },
    { header: "Monthly", key: "monthly", width: 16 },
    { header: "Saved so far", key: "saved", width: 16 },
    { header: "Remaining", key: "remaining", width: 16 },
  ];
  styleHeaderRow(ws.getRow(1));

  const {
    accommodation_cost,
    activities_cost,
    travel_cost,
    buffer_cost,
    total_cost,
    start_date,
  } = trip;

  // TripSummaryRow's numeric columns are nullable (it's a view).
  const accommodationCost = accommodation_cost ?? 0;
  const activitiesCost = activities_cost ?? 0;
  const travelCost = travel_cost ?? 0;
  const bufferCost = buffer_cost ?? 0;
  const totalCost = total_cost ?? 0;

  const monthlyFor = (cost: number, span: number) =>
    span > 0 ? Math.round(cost / span) : 0;

  // Same calculation as BudgetPanel.monthsSavedFor — kept in lockstep
  // intentionally, since this is exactly the logic that drifted last time.
  const monthsSavedFor = (span: number) => {
    const savingWindowOpens = dayjs(start_date).subtract(span, "month");
    const elapsed = dayjs().diff(savingWindowOpens, "month");
    return Math.min(Math.max(elapsed, 0), span);
  };

  const categories = [
    {
      name: "Accommodation",
      type: "Accommodation",
      cost: accommodationCost,
      span: months.accommodation,
    },
    {
      name: "Itinerary Activities",
      type: "Itinerary",
      cost: activitiesCost,
      span: months.activities,
    },
    {
      name: "Transport",
      type: "Travel",
      cost: travelCost,
      span: months.transport,
    },
    {
      name: "Buffer",
      type: "Buffer",
      cost: bufferCost,
      span: months.buffer,
    },
  ];

  const rows = categories.map((c) => {
    const monthly = monthlyFor(c.cost, c.span);
    const saved = Math.min(monthly * monthsSavedFor(c.span), c.cost);
    return { ...c, monthly, saved, remaining: Math.max(0, c.cost - saved) };
  });

  rows.forEach((r) =>
    ws.addRow({
      name: r.name,
      type: r.type,
      cost: `${currency} ${r.cost}`,
      timespan: `${r.span} ${r.span === 1 ? "month" : "months"}`,
      monthly: `${currency} ${r.monthly}`,
      saved: `${currency} ${r.saved}`,
      remaining: `${currency} ${r.remaining}`,
    }),
  );

  const monthlyTotal = sum(rows.map((r) => r.monthly));
  const savedTotal = sum(rows.map((r) => r.saved));
  const remainingTotal = Math.max(0, totalCost - savedTotal);
  const savedPct =
    totalCost > 0 ? Math.round((savedTotal / totalCost) * 100) : 0;

  ws.addRow({});
  const totalRow = ws.addRow({
    name: "Budget total",
    type: "",
    cost: `${currency} ${totalCost}`,
    timespan: "",
    monthly: `${currency} ${monthlyTotal}`,
    saved: `${currency} ${savedTotal}`,
    remaining: `${currency} ${remainingTotal}`,
  });
  totalRow.font = { bold: true };

  ws.addRow({});
  ws.addRow({ name: `${savedPct}% saved toward this trip's budget` });

  centerColumnsFrom(ws, 3);
};

// ---------------------------------------------------------------------------
// Transport sheet
// ---------------------------------------------------------------------------
const travelSheet = (trip: TripSummaryRow, workbook: ExcelJS.Workbook) => {
  const currency = useCurrencyStore.getState().symbol;
  const ws = workbook.addWorksheet("Transport for Trip");

  ws.columns = [
    { header: "Name", key: "name", width: 33 },
    { header: "Type", key: "type", width: 19 },
    { header: "Cost", key: "cost", width: 21 },
    { header: "Start - End Date", key: "dates", width: 29 },
  ];
  styleHeaderRow(ws.getRow(1));

  const travels = useTransportStore
    .getState()
    .transports.filter((travel) => travel.trip_id === trip.id);

  travels
    .sort(
      (a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf(),
    )
    .forEach(({ name, type, cost, start_date, end_date }) => {
      ws.addRow({
        name,
        type,
        cost: `${currency} ${cost}`,
        dates: `${dayjs(start_date).format("DD MMM")} - ${dayjs(end_date).format("DD MMM YYYY")}`,
      });
    });

  centerColumnsFrom(ws, 3);
};

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
export const exportTripXLSX = async (
  trip: TripSummaryRow & { start_date: string; end_date: string },
) => {
  if (!trip) return;

  const months = DEFAULT_BUDGET_MONTHS;

  const locations = useLocationStore.getState().locations;
  const fetchActivities = useActivityStore.getState().fetchByLocation;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Zula";
  workbook.created = new Date();

  summarySheet(locations, trip, workbook);

  for (const location of locations) {
    await fetchActivities(location.id);
    locationSheet(location, workbook, true);
  }

  travelSheet(trip, workbook);
  budgetSheet(trip, workbook, months);

  // ExcelJS writes a Buffer; download it in the browser.
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  // trip.name is nullable (view column) — fall back so the download never
  // gets a literal "null.xlsx" filename.
  anchor.download = `${trip.name ?? "Trip"}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
