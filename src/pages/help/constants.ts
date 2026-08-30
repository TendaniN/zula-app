export const FAQ_SECTIONS = [
  {
    section: "Getting started",
    items: [
      {
        q: "How do I create my first trip?",
        a: "Hit “＋ New trip” on My trips, give it a name, pick a cover and a currency. Dates are optional - add locations first and Zula works out the span for you.",
      },
    ],
  },
  {
    section: "Trips & stays",
    items: [
      {
        q: "What’s the difference between a stay and an activity?",
        a: "A stay is one place you sleep: city, dates, accommodation, nightly rate. Activities live inside that stay’s itinerary, grouped day by day.",
      },
      {
        q: "Can I add travel between two cities?",
        a: "Yes. The Transport tab takes flights, trains, buses and ferries with departure and arrival times - legs that land the next day get a “+1 day” marker automatically.",
      },
    ],
  },
  {
    section: "Budget",
    items: [
      {
        q: "How is the trip total worked out?",
        a: "Nights × nightly rate for every stay, plus every activity cost, plus every transport leg. Change the currency in the sidebar and the whole trip converts.",
      },
      {
        q: "Can I set a monthly savings target?",
        a: "Open the Budget tab and enter what you can put aside each month. Zula shows how many months the trip needs and warns you when departure is closer than that.",
      },
    ],
  },
  {
    section: "Sharing",
    items: [
      {
        q: "Who can edit a trip I’ve shared?",
        a: "Editors can add and change anything. Viewers can only read. Only the owner invites people, changes roles, or deletes the trip.",
      },
      {
        q: "Why is this trip read-only?",
        a: "Either you were invited as a Viewer, or the trip is already under way or completed. An owner can reopen a completed trip from trip settings.",
      },
    ],
  },
  {
    section: "Travellers",
    items: [
      {
        q: "What can a traveller do?",
        a: "Travellers can view a shared trip — the itinerary, budget and travel — but they can't edit or delete anything. Full control stays with the trip owner.",
      },
      {
        q: "How does someone join a trip?",
        a: "You invite them by email. They open the share link and confirm using the same email they were invited with, after which the trip appears for them in read-only mode.",
      },
    ],
  },
];

import quickPlanGif from "@/assets/gifs/quick-plan.gif";
import quickStaysGif from "@/assets/gifs/quick-stays.gif";
import quickShareGif from "@/assets/gifs/quick-share.gif";

export const QUICK_STARTS: {
  id: string;
  title: string;
  blurb: string;
  steps: number;
  mins: number;
  gif: string;
  accent: string;
}[] = [
  {
    id: "plan",
    title: "Plan a trip end to end",
    blurb: "Name it, add two cities, let Zula total it up.",
    steps: 4,
    mins: 3,
    gif: quickPlanGif,
    accent: "lavender",
  },
  {
    id: "stays",
    title: "Stays, transport & to-dos",
    blurb: "Where you sleep, how you move, what's left to book.",
    steps: 3,
    mins: 2,
    gif: quickStaysGif,
    accent: "mint",
  },
  {
    id: "share",
    title: "Share and split the cost",
    blurb: "Invite editors, set a savings target, export the plan.",
    steps: 3,
    mins: 2,
    gif: quickShareGif,
    accent: "peach",
  },
];

export const WHATS_NEW = [
  // 0.3.0 — 23 Aug 2026
  {
    title: "Invite travellers to a trip by email",
    date: "Aug 23, 2026",
    color: "peach",
  },
  {
    title: "Light, dark, and auto themes",
    date: "Aug 23, 2026",
    color: "lavender",
  },
  {
    title: "Zula works on any screen size",
    date: "Aug 23, 2026",
    color: "mint",
  },
  {
    title: "Keyboard and screen-reader friendly",
    date: "Aug 23, 2026",
    color: "lavender",
  },
];
