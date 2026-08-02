import PptxGenJS from "pptxgenjs";
import dayjs from "dayjs";
import type { TripSummaryRow, Location } from "@/types/models";
import { useLocationStore } from "@/stores/locationStore";
import { useActivityStore } from "@/stores/activityStore";
import { calcNights } from "../calcNights";
import { getCountryFlagSvgUri } from "../flagSvgString";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useTransportStore } from "@/stores/transportStore";
import { formatDuration } from "../formatDuration";
import { DEFAULT_BUDGET_MONTHS, type BudgetMonths } from "@/constants/budget";

import { workingSumDays, sum } from "../sum";

const FLAG_W = 1; // inches
const FLAG_H = 0.667; // 3:2
const GAP = 0.1;

const buildSummarySlide = (
  pptx: PptxGenJS,
  trip: TripSummaryRow & { start_date: string; end_date: string },
  locations: Location[],
) => {
  const slide = pptx.addSlide();
  slide.addText(
    [
      { text: "Total number of nights: ", options: { bold: true } },
      { text: String(calcNights(trip.start_date, trip.end_date)) },
    ],
    { x: 0.5, y: 0.35, w: 9, align: "center", fontSize: 14 },
  );

  slide.addText(
    [
      { text: "Total number of working days: ", options: { bold: true } },
      {
        text: String(workingSumDays(trip.start_date, trip.end_date)),
      },
    ],
    { x: 0.5, y: 0.6, w: 9, align: "center", fontSize: 14 },
  );

  let cursorY = 1.05;

  locations.forEach((loc) => {
    const country = loc.country;
    const data = country ? getCountryFlagSvgUri(country) : null;
    // Accommodation is its own table now (1:0..1 with locations), not a
    // flat accommodation_name/_type/_link column on Location.
    const accommodation = useLocationStore.getState().accommodationFor(loc.id);

    if (data) {
      slide.addImage({
        data,
        x: 0.5,
        y: cursorY + 0.2,
        w: 0.5,
        h: 0.333,
        shadow: {
          type: "outer",
          color: "878787",
          blur: 2,
          offset: 1,
          angle: 90,
          opacity: 0.2,
        },
      });
    }

    // Country header
    slide.addText(country ?? "Unknown", {
      x: data ? 0.9 : 0.5,
      y: cursorY,
      fontSize: 16,
      bold: true,
    });

    cursorY += 0.25;

    // Left column
    slide.addText(
      [{ text: "City: ", options: { bold: true } }, { text: loc.city }],
      {
        x: data ? 1 : 0.5,
        y: cursorY,
        w: 4.5,
        fontSize: 12,
        bullet: true,
      },
    );
    cursorY += 0.2;

    slide.addText(
      [
        { text: "Nights: ", options: { bold: true } },
        { text: String(calcNights(loc.start_date, loc.end_date)) },
      ],
      {
        x: data ? 1 : 0.5,
        y: cursorY,
        w: 4.5,
        fontSize: 12,
        bullet: true,
      },
    );
    cursorY += 0.2;

    // Right column
    slide.addText(
      [
        { text: "Date: ", options: { bold: true } },
        {
          text: `${dayjs(loc.start_date).format("ddd, DD MMM")} - ${dayjs(loc.end_date).format("ddd, DD MMM YYYY")}`,
        },
      ],
      {
        x: 5,
        y: cursorY - 0.45,
        w: 4.3,
        fontSize: 12,
        bullet: true,
      },
    );
    slide.addText(
      [
        {
          text: `${accommodation?.type ?? ""}: `,
          options: { bold: true },
        },
        {
          text: accommodation?.name ?? "-",
          options: {
            hyperlink: accommodation?.link
              ? { url: accommodation.link }
              : undefined,
            color: accommodation?.name ? "0000FF" : undefined,
            underline: {
              style: accommodation?.name ? "dashLong" : undefined,
            },
          },
        },
      ],
      {
        x: 5,
        y: cursorY - 0.45 + 0.2,
        w: 4.3,
        fontSize: 12,
        bullet: true,
      },
    );
    cursorY += 0.2;
  });
};

const buildLocationSlide = (
  pptx: PptxGenJS,
  location: Location,
  includeActivities = false,
) => {
  const slide = pptx.addSlide();
  const currency = useCurrencyStore.getState().symbol;
  const accommodation = useLocationStore
    .getState()
    .accommodationFor(location.id);

  // Title
  slide.addText(location.city, {
    x: 0.5,
    y: 0.3,
    fontSize: 24,
    bold: true,
  });

  // Slide header
  slide.addText(
    [
      { text: "Arrive: ", options: { bold: true } },
      { text: dayjs(location.start_date).format("DD MMM YYYY") },
    ],
    { x: 0.5, y: 0.75, fontSize: 12 },
  );

  slide.addText(
    [
      { text: "Depart: ", options: { bold: true } },
      { text: dayjs(location.end_date).format("DD MMM YYYY") },
    ],
    { x: 5.5, y: 0.75, fontSize: 12 },
  );

  slide.addText(
    [
      { text: "Nights: ", options: { bold: true } },
      { text: String(calcNights(location.start_date, location.end_date)) },
    ],
    { x: 0.5, y: 1, fontSize: 12 },
  );

  slide.addText(
    [
      {
        text: `${accommodation?.type ?? "-"}: `,
        options: { bold: true },
      },
      { text: accommodation?.name ?? "-" },
    ],
    { x: 5.5, y: 1, fontSize: 12 },
  );

  if (includeActivities) {
    // byLocation is the store's own selector for this — avoids duplicating
    // the filter logic (same fix as the XLSX/PDF exports).
    const activities = useActivityStore.getState().byLocation(location.id);

    // Table data
    const itineraryRows = activities
      .sort(
        (a, b) =>
          dayjs(a.activity_date).valueOf() - dayjs(b.activity_date).valueOf(),
      )
      .map((activity) => [
        { text: dayjs(activity.activity_date).format("ddd, DD MMM YYYY") },
        {
          text: activity.activity_time
            ? activity.activity_time.slice(0, 5)
            : "-",
        },
        { text: activity.name },
        { text: `${currency}${activity.cost}` },
        { text: formatDuration(activity.duration_minutes) || "-" },
        {
          text: "link",
          options: {
            hyperlink: activity.link ? { url: activity.link } : undefined,
            color: activity.link ? "0000FF" : "808080",
            underline: { style: "dashLong" as const },
          },
        },
      ]);

    slide.addTable(
      [
        [
          { text: "Date", options: { bold: true, align: "center" } },
          { text: "Time", options: { bold: true, align: "center" } },
          { text: "Activity", options: { bold: true, align: "center" } },
          {
            text: `Cost (${currency})`,
            options: { bold: true, align: "center" },
          },
          {
            text: "Duration",
            options: { bold: true, align: "center" },
          },
          { text: "Link", options: { bold: true, align: "center" } },
        ],
        ...itineraryRows,
      ],
      {
        x: 0.25,
        y: 1.15,
        w: 9,
        colW: [1.8, 0.9, 3.6, 1.2, 1.1, 0.9],
        border: { type: "solid", color: "999999" },
        fontSize: 10,
        align: "center",
        autoPage: true, // split across slides when it overflows
        autoPageRepeatHeader: true, // repeat the header row on each new slide
        autoPageHeaderRows: 1, // how many leading rows count as the header
        autoPageSlideStartY: 0.5,
      },
    );
  }
};

const buildTravelSlide = (pptx: PptxGenJS, trip: TripSummaryRow) => {
  const currency = useCurrencyStore.getState().symbol;

  const slide = pptx.addSlide();

  // Title
  slide.addText("Travel Plan", {
    x: 0.5,
    y: 0.3,
    fontSize: 24,
    bold: true,
  });

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: "Name", options: { bold: true, align: "center" } },
      { text: "Type", options: { bold: true, align: "center" } },
      {
        text: `Cost (${currency})`,
        options: { bold: true, align: "center" },
      },
      {
        text: "Duration",
        options: { bold: true, align: "center" },
      },
      {
        text: "Start - End Date",
        options: { bold: true, align: "center" },
      },
    ],
  ];

  const transports = useTransportStore
    .getState()
    .transports.filter((transport) => transport.trip_id === trip.id);

  transports.forEach((transport) => {
    tableRows.push([
      { text: transport.name, options: { align: "center" } },
      { text: transport.type, options: { align: "center" } },
      {
        text: `${currency} ${Math.round(transport.cost * 100) / 100}`,
        options: { align: "center" },
      },
      {
        text: formatDuration(transport.duration_minutes) || "-",
        options: { align: "center" },
      },
      {
        text: `${dayjs(transport.start_date).format(
          "DD MMM",
        )} - ${dayjs(transport.end_date).format("DD MMM YYYY")}`,
        options: { align: "center" },
      },
    ]);
  });

  // Table
  slide.addTable(tableRows, {
    x: 0.3,
    y: 1,
    w: 9.4,
    colW: [3.1, 1.4, 1.4, 1.6, 1.9],
    border: { type: "solid", color: "666666" },
    fill: { color: "F9F9F9" },
    fontSize: 12,
    autoPage: true, // split across slides when it overflows
    autoPageRepeatHeader: true, // repeat the header row on each new slide
    autoPageHeaderRows: 1, // how many leading rows count as the header
    autoPageSlideStartY: 0.5,
  });
};

const buildBudgetSlide = (
  pptx: PptxGenJS,
  trip: TripSummaryRow & { start_date: string; end_date: string },
  months: BudgetMonths = DEFAULT_BUDGET_MONTHS,
) => {
  const currency = useCurrencyStore.getState().symbol;
  const slide = pptx.addSlide();

  const accommodationCost = trip.accommodation_cost ?? 0;
  const activitiesCost = trip.activities_cost ?? 0;
  const travelCost = trip.travel_cost ?? 0;
  const bufferCost = trip.buffer_cost ?? 0;
  const totalCost = trip.total_cost ?? 0;

  const monthlyFor = (cost: number, span: number) =>
    span > 0 ? Math.round(cost / span) : 0;

  // Same calculation as BudgetPanel.monthsSavedFor / the XLSX + PDF exports
  // — kept in lockstep deliberately.
  const monthsSavedFor = (span: number) => {
    const savingWindowOpens = dayjs(trip.start_date).subtract(span, "month");
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

  const monthlyTotal = sum(rows.map((r) => r.monthly));
  const savedTotal = sum(rows.map((r) => r.saved));
  const remainingTotal = Math.max(0, totalCost - savedTotal);
  const savedPct =
    totalCost > 0 ? Math.round((savedTotal / totalCost) * 100) : 0;

  // Title + saved-% subtitle (placed above the table rather than below it,
  // since pptxgenjs doesn't report a rendered table's height up front —
  // positioning text under a variable-height table would need manual
  // guesswork).
  slide.addText("Budget Plan", {
    x: 0.5,
    y: 0.3,
    fontSize: 24,
    bold: true,
  });
  slide.addText(`${savedPct}% saved toward this trip's budget`, {
    x: 0.5,
    y: 0.7,
    fontSize: 13,
    color: "666666",
  });

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: "Category", options: { bold: true, align: "center" } },
      { text: "Type", options: { bold: true, align: "center" } },
      {
        text: `Cost (${currency})`,
        options: { bold: true, align: "center" },
      },
      { text: "Timespan", options: { bold: true, align: "center" } },
      { text: "Monthly", options: { bold: true, align: "center" } },
      { text: "Saved so far", options: { bold: true, align: "center" } },
      { text: "Remaining", options: { bold: true, align: "center" } },
    ],
  ];

  rows.forEach((r) => {
    tableRows.push([
      { text: r.name },
      { text: r.type },
      { text: `${currency} ${r.cost}`, options: { align: "center" } },
      {
        text: `${r.span} ${r.span === 1 ? "month" : "months"}`,
        options: { align: "center" },
      },
      {
        text: `${currency} ${Math.round(r.monthly * 100) / 100}`,
        options: { align: "center" },
      },
      {
        text: `${currency} ${Math.round(r.saved * 100) / 100}`,
        options: { align: "center" },
      },
      {
        text: `${currency} ${Math.round(r.remaining * 100) / 100}`,
        options: { align: "center" },
      },
    ]);
  });

  tableRows.push([
    { text: "Budget Total", options: { bold: true } },
    { text: "-" },
    {
      text: `${currency} ${totalCost}`,
      options: { align: "center", bold: true },
    },
    { text: "-" },
    {
      text: `${currency} ${monthlyTotal}`,
      options: { align: "center", bold: true },
    },
    {
      text: `${currency} ${savedTotal}`,
      options: { align: "center", bold: true },
    },
    {
      text: `${currency} ${remainingTotal}`,
      options: { align: "center", bold: true },
    },
  ]);

  slide.addTable(tableRows, {
    x: 0.3,
    y: 1.1,
    w: 9.4,
    colW: [1.5, 1.1, 1.1, 1.0, 1.1, 1.3, 1.3],
    border: { type: "solid", color: "666666" },
    fill: { color: "F9F9F9" },
    fontSize: 11,
  });
};

export const exportTripPPT = async (
  trip: TripSummaryRow & { start_date: string; end_date: string },
) => {
  if (!trip) return;

  const months = DEFAULT_BUDGET_MONTHS;

  const locations = useLocationStore
    .getState()
    .locations.filter((loc) => loc.trip_id === trip.id);
  const fetchActivities = useActivityStore.getState().fetchByLocation;

  const pptx = new PptxGenJS();

  const titleSlide = pptx.addSlide();

  titleSlide.addText(trip.name ?? "Trip", {
    x: 1,
    y: 1.5,
    fontSize: 32,
    bold: true,
  });

  let x = 1;
  // countries is a nullable view column.
  for (const country of trip.countries ?? []) {
    const data = getCountryFlagSvgUri(country);
    if (!data) continue;

    titleSlide.addImage({
      data,
      x,
      y: 0.5,
      w: FLAG_W,
      h: FLAG_H,
      shadow: {
        type: "outer",
        color: "878787",
        blur: 2,
        offset: 1,
        angle: 90,
        opacity: 0.2,
      },
    });
    x += FLAG_W + GAP;
  }

  titleSlide.addText(
    `${dayjs(trip.start_date).format("dddd, DD MMMM YYYY")} → ${dayjs(trip.end_date).format("dddd, DD MMMM YYYY")}`,
    {
      x: 1,
      y: 2.5,
      fontSize: 16,
    },
  );

  buildSummarySlide(pptx, trip, locations);

  for (const location of locations) {
    await fetchActivities(location.id);
    buildLocationSlide(pptx, location, true);
  }

  buildTravelSlide(pptx, trip);
  buildBudgetSlide(pptx, trip, months);

  pptx.writeFile({ fileName: `${trip.name ?? "Trip"}.pptx` });
};
