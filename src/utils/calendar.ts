import { createEvent, createEvents } from "ics";

export interface CalendarEventData {
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  start: Date;
  end: Date;
}

export const downloadCalendarEvents = (events: CalendarEventData[]): void => {
  const calendarEvents = events.map((event) => ({
    title: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    url: event.url ?? undefined,

    start: [
      event.start.getFullYear(),
      event.start.getMonth() + 1,
      event.start.getDate(),
      event.start.getHours(),
      event.start.getMinutes(),
    ] as [number, number, number, number, number],

    end: [
      event.end.getFullYear(),
      event.end.getMonth() + 1,
      event.end.getDate(),
      event.end.getHours(),
      event.end.getMinutes(),
    ] as [number, number, number, number, number],
  }));

  const result = createEvents(calendarEvents);

  if (result.error || !result.value) {
    console.error("Failed to create calendar:", result.error);
    return;
  }

  const blob = new Blob([result.value], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "zula-itinerary.ics";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const downloadCalendarEvent = (eventData: CalendarEventData): void => {
  const event = createEvent({
    title: eventData.title,
    description: eventData.description ?? undefined,
    location: eventData.location ?? undefined,
    url: eventData.url ?? undefined,

    start: [
      eventData.start.getFullYear(),
      eventData.start.getMonth() + 1,
      eventData.start.getDate(),
      eventData.start.getHours(),
      eventData.start.getMinutes(),
    ],

    end: [
      eventData.end.getFullYear(),
      eventData.end.getMonth() + 1,
      eventData.end.getDate(),
      eventData.end.getHours(),
      eventData.end.getMinutes(),
    ],
  });

  if (event.error || !event.value) {
    console.error("Failed to create calendar event:", event.error);
    return;
  }

  const blob = new Blob([event.value], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventData.title
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
