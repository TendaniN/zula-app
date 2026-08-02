import pdfMake from "./pdf";
import dayjs from "dayjs";
import { workingSumDays, sum } from "../sum";
import { useLocationStore } from "@/stores/locationStore";
import { calcNights } from "../calcNights";
import { useActivityStore } from "@/stores/activityStore";
import { useTransportStore } from "@/stores/transportStore";
import { useCurrencyStore } from "@/stores/currencyStore";
import { formatDuration } from "../formatDuration";
import { DEFAULT_BUDGET_MONTHS } from "@/constants/budget";

const styles = {
  title: {
    fontSize: 28,
    bold: true,
    margin: [0, 0, 0, 12],
    alignment: "center",
  },
  tableHeader: {
    bold: true,
    background: "",
    fillColor: "#F0F0F0",
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 0, 0, 8],
  },
};

const TABLE_LAYOUT = {
  hLineWidth: function (i, node) {
    return i === 0 || i === node.table.body.length ? 2 : 1;
  },
  vLineWidth: function (i, node) {
    return i === 0 || i === node.table.widths.length ? 2 : 1;
  },
  hLineColor: function (i, node) {
    return i === 0 || i === node.table.body.length ? "black" : "gray";
  },
  vLineColor: function (i, node) {
    return i === 0 || i === node.table.widths.length ? "black" : "gray";
  },
  paddingLeft: function () {
    return 4;
  },
  paddingRight: function () {
    return 4;
  },
};

const buildSummaryPage = (locations, trip) => [
  { text: trip.name, style: "title" },
  {
    text: [
      { text: "Total number of nights: ", bold: true },
      String(calcNights(trip.start_date, trip.end_date)),
    ],
    alignment: "center",
  },
  {
    text: [
      { text: "Total number of working days: ", bold: true },
      String(workingSumDays(trip.start_date, trip.end_date)),
    ],
    alignment: "center",
    margin: [0, 0, 0, 8],
  },
  ...locations.map((location) => {
    const accommodation = useLocationStore
      .getState()
      .accommodationFor(location.id);

    return [
      { text: location.country, style: "subheader" },
      {
        columns: [
          {
            ul: [
              [
                {
                  text: [
                    { text: "City: ", bold: true },
                    { text: location.city },
                  ],
                },
              ],

              [
                {
                  text: [
                    { text: "Nights: ", bold: true },
                    {
                      text: String(
                        calcNights(location.start_date, location.end_date),
                      ),
                    },
                  ],
                },
              ],
            ],
          },
          {
            ul: [
              [
                {
                  text: [
                    { text: "Arrive: ", bold: true },
                    {
                      text: dayjs(location.start_date).format(
                        "dddd, DD MMMM YYYY",
                      ),
                    },
                  ],
                },
              ],
              [
                {
                  text: [
                    { text: "Depart: ", bold: true },
                    {
                      text: dayjs(location.end_date).format(
                        "dddd, DD MMMM YYYY",
                      ),
                    },
                  ],
                },
              ],
            ],
          },
        ],
      },
      {
        ul: [
          {
            text: [
              { text: "Hotel: ", bold: true },
              { text: accommodation?.name ?? "not selected" },
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
    ];
  }),
];

const buildLocationPage = (location, includeActivities = false) => {
  const currency = useCurrencyStore.getState().symbol;
  const accommodation = useLocationStore
    .getState()
    .accommodationFor(location.id);

  const finalDisplay = [
    {
      pageBreak: "before",
      pageOrientation: includeActivities ? "landscape" : "portrait",
      text: `${location.city}, ${location.country}`,
      style: "subheader",
    },
    {
      columns: [
        {
          text: [
            { text: "Arrive: ", bold: true },
            { text: location.start_date },
          ],
        },
        {
          text: [{ text: "Depart: ", bold: true }, String(location.end_date)],
        },
      ],
    },
    {
      columns: [
        {
          text: [
            { text: "Nights: ", bold: true },
            String(calcNights(location.start_date, location.end_date)),
          ],
        },
        {
          text: [
            {
              text: accommodation?.type
                ? `${accommodation.type}: `
                : "Accommodation: ",
              bold: true,
            },
            { text: accommodation?.name ?? "" },
          ],
          margin: [0, 0, 0, 16],
        },
      ],
    },
  ];

  if (includeActivities) {
    // byLocation is the store's own selector for this — avoids duplicating
    // the filter logic (and staying in sync if the store's internal shape
    // ever changes), same fix as the XLSX export.
    const activities = useActivityStore.getState().byLocation(location.id);

    const itineraryMAP = activities
      .sort(
        (a, b) =>
          dayjs(a.activity_date).valueOf() - dayjs(b.activity_date).valueOf(),
      )
      .map(({ activity_time, name, duration_minutes, cost, link, activity_date }) => [
        dayjs(activity_date).format("dddd, DD MMMM YYYY"),
        {
          text: activity_time ? activity_time.slice(0, 5) : "",
          alignment: "center",
        },
        name,
        { text: `${currency} ${cost}`, alignment: "center" },
        { text: formatDuration(duration_minutes), alignment: "center" },
        link
          ? {
              text: "link",
              link: link,
              color: "blue",
              decoration: "underline",
              alignment: "center",
            }
          : { text: "", alignment: "center" },
      ]);

    finalDisplay.push({
      layout: TABLE_LAYOUT,
      table: {
        widths: [130, 60, 300, 85, 65, 70],
        body: [
          [
            { text: "Date", style: "tableHeader", alignment: "center" },
            { text: "Time", style: "tableHeader", alignment: "center" },
            { text: "Activity", style: "tableHeader", alignment: "center" },
            {
              text: `Cost (in ${currency})`,
              style: "tableHeader",
              alignment: "center",
            },
            {
              text: "Duration",
              style: "tableHeader",
              alignment: "center",
            },
            { text: "Link", style: "tableHeader", alignment: "center" },
          ],
          ...itineraryMAP,
        ],
      },
    });
  }

  return finalDisplay;
};

const buildTravelPage = (trip) => {
  const currency = useCurrencyStore.getState().symbol;

  const transports = useTransportStore
    .getState()
    .transports.filter((transport) => transport.trip_id === trip.id);

  const travelMap = transports
    .sort(
      (a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf(),
    )
    .map(({ name, type, cost, duration_minutes, start_date, end_date }) => [
      { text: name, alignment: "center" },
      { text: type, alignment: "center" },
      { text: `${currency} ${cost}`, alignment: "center" },
      { text: formatDuration(duration_minutes), alignment: "center" },
      {
        text: `${dayjs(start_date).format(
          "DD MMM",
        )} - ${dayjs(end_date).format("DD MMM YYYY")}`,
        alignment: "center",
      },
    ]);

  return [
    {
      pageBreak: "before",
      pageOrientation: "landscape",
      text: `Transport for Trip (${transports.length})`,
      style: "subheader",
    },
    {
      layout: TABLE_LAYOUT,
      table: {
        // 5 widths for 5 columns — the original had 6 widths for a 5-column
        // table (Name/Type/Cost/Duration/Dates), which would have thrown off
        // pdfmake's column sizing.
        widths: [130, 88, 100, 100, 150],
        body: [
          [
            { text: "Name", style: "tableHeader", alignment: "center" },
            { text: "Type", style: "tableHeader", alignment: "center" },
            {
              text: `Cost (in ${currency})`,
              style: "tableHeader",
              alignment: "center",
            },
            {
              text: "Duration",
              style: "tableHeader",
              alignment: "center",
            },
            {
              text: "Start - End Date",
              style: "tableHeader",
              alignment: "center",
            },
          ],
          ...travelMap,
        ],
      },
    },
  ];
};

const buildBudgetPage = (trip, months = DEFAULT_BUDGET_MONTHS) => {
  const currency = useCurrencyStore.getState().symbol;

  const accommodationCost = trip.accommodation_cost ?? 0;
  const activitiesCost = trip.activities_cost ?? 0;
  const travelCost = trip.travel_cost ?? 0;
  const bufferCost = trip.buffer_cost ?? 0;
  const totalCost = trip.total_cost ?? 0;

  const monthlyFor = (cost, span) => (span > 0 ? Math.round(cost / span) : 0);

  // Same calculation as BudgetPanel.monthsSavedFor / the XLSX export —
  // kept in lockstep deliberately, since this is exactly the logic that
  // drifted between files last time.
  const monthsSavedFor = (span) => {
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

  return [
    {
      pageBreak: "before",
      pageOrientation: "landscape",
      text: "Budget Plan",
      style: "subheader",
    },
    {
      layout: TABLE_LAYOUT,
      table: {
        widths: [130, 80, 70, 70, 70, 75, 75],
        body: [
          [
            { text: "Category", style: "tableHeader", alignment: "center" },
            { text: "Type", style: "tableHeader", alignment: "center" },
            {
              text: `Cost (in ${currency})`,
              style: "tableHeader",
              alignment: "center",
            },
            { text: "Timespan", style: "tableHeader", alignment: "center" },
            { text: "Monthly", style: "tableHeader", alignment: "center" },
            {
              text: "Saved so far",
              style: "tableHeader",
              alignment: "center",
            },
            { text: "Remaining", style: "tableHeader", alignment: "center" },
          ],
          ...rows.map((r) => [
            r.name,
            r.type,
            { text: `${currency} ${r.cost}`, alignment: "center" },
            {
              text: `${r.span} ${r.span === 1 ? "month" : "months"}`,
              alignment: "center",
            },
            { text: `${currency} ${Math.round(r.monthly * 100) / 100}`, alignment: "center" },
            { text: `${currency} ${Math.round(r.saved * 100) / 100}`, alignment: "center" },
            { text: `${currency} ${Math.round(r.remaining * 100) / 100}`, alignment: "center" },
          ]),
          [
            { text: "Budget Total", bold: true },
            "-",
            {
              text: `${currency} ${totalCost}`,
              alignment: "center",
              bold: true,
            },
            "-",
            {
              text: `${currency} ${monthlyTotal}`,
              alignment: "center",
              bold: true,
            },
            {
              text: `${currency} ${savedTotal}`,
              alignment: "center",
              bold: true,
            },
            {
              text: `${currency} ${remainingTotal}`,
              alignment: "center",
              bold: true,
            },
          ],
        ],
      },
    },
    {
      text: `${savedPct}% saved toward this trip's budget`,
      margin: [0, 8, 0, 0],
    },
  ];
};

export const exportTripPDF = async (trip) => {
  if (!trip) return;

  const months = DEFAULT_BUDGET_MONTHS;

  const locations = useLocationStore.getState().locations;
  const fetchActivities = useActivityStore.getState().fetchByLocation;

  let content = [...buildSummaryPage(locations, trip)];

  for (const location of locations) {
    await fetchActivities(location.id);
    content.push(...buildLocationPage(location, true));
  }

  content.push(...buildTravelPage(trip));
  content.push(...buildBudgetPage(trip));


  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content,
    styles,
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: "center",
      fontSize: 8,
    }),
  };

  pdfMake.createPdf(docDefinition).download(`${trip.name}.pdf`);
};
