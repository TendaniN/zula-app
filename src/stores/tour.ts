import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// onComplete lets callers do different things when the tour finishes
// (onboarding marks the flag; Help replay does nothing).
export function startTour(opts?: { onComplete?: () => void }) {
  const d = driver({
    showProgress: true,
    popoverClass: "onboarding-popover",
    steps: [
      {
        element: '[data-tour="nav-trips"]',
        popover: {
          title: "Every trip in one place",
          description:
            "Trips you own and trips you've been invited to. The colour band says planning, active or done.",
        },
      },
      {
        element: '[data-tour="new-trip"]',
        popover: {
          title: "Start in My trips",
          description:
            "Brand new account, empty list - hit ＋ New trip to create your first one.",
        },
      },
      {
        element: '[data-tour="trip-modal"]',
        popover: {
          title: "Name it and give it a description",
          description:
            "That’s the whole form - a name, descriiption and add an optional buffer for the budget. Nothing else is required to create a trip.",
        },
      },
      {
        element: '[data-tour="trip-tabs"]',
        popover: {
          title: "Four tabs per trip",
          description:
            "Stays, Transport, To-dos, Budget. Everything about one trip stays on one page.",
        },
      },
      {
        element: '[data-tour="add-stay"]',
        popover: {
          title: "Start with a stay",
          description:
            "A stay is a city plus dates. Once it exists you can drop activities into its day-by-day itinerary.",
        },
      },
      {
        element: '[data-tour="trip-cost"]',
        popover: {
          title: "Costs add themselves up",
          description:
            "Nights, activities and transport roll into the trip total here. Switch currency any time.",
        },
      },
      {
        element: '[data-tour="share-trip"]',
        popover: {
          title: "Plan it with other people",
          description:
            "Invite as Editor to plan together, or Viewer for read-only. You stay the owner either way.",
        },
      },
    ],
    // Fires on Finish AND on Skip/close — so onboarding completes either way.
    onDestroyed: () => opts?.onComplete?.(),
  });

  d.drive();
}
