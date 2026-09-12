/**
 *
 * "Leaving home" checklist — the non-packing things to sort before a long trip,
 * grouped by category. Tasks are one-time (done once), so no quantities — the
 * panel tracks a single done/not-done tick per task in local state.
 *
 * `note` carries a parenthetical detail; `packingHint` cross-references the
 * packing list (rendered distinctly, e.g. "→ packing: Medicine Bag") so items
 * that overlap aren't duplicated as separate checkboxes across the two features.
 *
 * Items under "extra suggestions" were added on top of the source list as
 * common-but-easily-forgotten additions — trim any that don't apply.
 */

export type DepartureCategory =
  | "Home & security"
  | "Mail & deliveries"
  | "Money & admin"
  | "People & living things"
  | "Health & docs"
  | "Devices & connectivity";

export interface DepartureItem {
  id: string;
  label: string;
  /** Parenthetical detail. */
  note?: string;
  /** Cross-reference into the packing list, shown as a subtle hint. */
  packingHint?: string;
}

export interface DepartureGroup {
  category: DepartureCategory;
  items: DepartureItem[];
}

export const DEPARTURE_CHECKLIST: DepartureGroup[] = [
  {
    category: "Home & security",
    items: [
      { id: "home-lockup", label: "Lock up, set timers/lights" },
      {
        id: "home-unplug",
        label: "Unplug non-essential appliances",
        note: "switch off plugs — bedroom; TV; wifi",
      },
      {
        id: "home-lights",
        label: "Switch off all lights",
        note: "bathroom; bedroom; living rooms",
      },
      { id: "home-geyser", label: "Turn off the geyser / water heater" },
      {
        id: "home-windows",
        label: "Close all windows",
        note: "bedroom; lounge; bathroom",
      },
      {
        id: "home-bins",
        label: "Take out the bins",
        note: "or cover food waste in bicarb of soda",
      },
      { id: "home-dishes", label: "Wash the dishes" },
      { id: "home-fridge", label: "Empty fridge of perishables" },
      { id: "home-thermostat", label: "Adjust thermostat / heating" },
      // — extra suggestions —
      { id: "home-alarm", label: "Set the security alarm" },
      { id: "home-curtains", label: "Draw curtains / blinds" },
      { id: "home-valuables", label: "Move valuables out of sight" },
      {
        id: "home-water-main",
        label: "Turn off water at the main",
        note: "for longer trips",
      },
    ],
  },
  {
    category: "Mail & deliveries",
    items: [
      { id: "mail-hold", label: "Hold mail" },
      { id: "mail-subs", label: "Pause subscription deliveries" },
      { id: "mail-parcels", label: "Redirect expected parcels" },
      // — extra suggestions —
      {
        id: "mail-recurring",
        label: "Cancel any recurring deliveries",
        note: "milk; newspaper",
      },
    ],
  },
  {
    category: "Money & admin",
    items: [
      { id: "money-notify-bank", label: "Notify bank/card of travel dates" },
      { id: "money-card-expiry", label: "Check card expiry" },
      { id: "money-autopay", label: "Set up bill autopay" },
      { id: "money-emergency", label: "Note emergency contacts" },
      // — extra suggestions —
      { id: "money-bills-due", label: "Pay any bills due while away" },
      { id: "money-ooo", label: "Set an out-of-office reply" },
      { id: "money-cash", label: "Withdraw some local cash" },
    ],
  },
  {
    category: "People & living things",
    items: [
      { id: "people-pets", label: "Arrange pet care" },
      { id: "people-plants", label: "Arrange plant watering" },
      { id: "people-check-house", label: "Someone to check the house" },
      {
        id: "people-share-itinerary",
        label: "Share itinerary with a trusted person",
      },
      // — extra suggestions —
      { id: "people-spare-key", label: "Leave a spare key with someone" },
      {
        id: "people-neighbour",
        label: "Give a neighbour your dates & contact",
      },
    ],
  },
  {
    category: "Health & docs",
    items: [
      {
        id: "health-prescriptions",
        label: "Pack prescriptions",
        packingHint: "packing list → Medicine Bag",
      },
      { id: "health-insurance", label: "Travel insurance confirmed" },
      { id: "health-copies", label: "Digital copies of passport/documents" },
      // — extra suggestions —
      { id: "health-passport-valid", label: "Passport valid 6+ months" },
      {
        id: "health-screenshots",
        label: "Screenshot bookings & confirmations",
      },
      { id: "health-embassy", label: "Note the local embassy contact" },
      {
        id: "health-vaccines",
        label: "Vaccinations up to date",
        note: "if required",
      },
    ],
  },
  {
    category: "Devices & connectivity",
    items: [
      { id: "dev-roaming", label: "Roaming / eSIM sorted" },
      { id: "dev-offline-maps", label: "Download offline maps" },
      { id: "dev-backup", label: "Back up phone" },
      {
        id: "dev-charge",
        label: "Charge phone, tablet & powerbank",
      },
      {
        id: "dev-chargers-packed",
        label: "Chargers/adapters packed",
        packingHint: "packing list → Airport Bag",
      },
      // — extra suggestions —
      { id: "dev-find-my", label: "Enable Find My phone" },
      { id: "dev-storage", label: "Free up phone storage for photos" },
      {
        id: "dev-entertainment",
        label: "Download entertainment for the flight",
      },
    ],
  },
];
