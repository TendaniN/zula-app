/**
 * src/mocks/mockData.ts
 *
 * Fully-linked mock dataset for Zula, usable before Supabase is wired up
 * (milestone 0.1.0). All records use the same shapes as `src/types/models.ts`,
 * and the same string formats Supabase/PostgREST return:
 *   - date         -> 'YYYY-MM-DD'
 *   - timestamptz  -> ISO 8601 (with time + offset)
 *   - time         -> 'HH:MM:SS'
 *
 * Relationships mirror the schema:
 *   profiles 1─* trips (owner_id)
 *   trips    *─* profiles via trip_members
 *   trips    1─* locations 1─(0..1) accommodations
 *   locations 1─* activities
 *   trips    1─* transports
 *   trips    1─* todos
 * The *_cost_summary values are precomputed to match the data (they stand in
 * for the read-only DB views).
 *
 * NOTE: requires src/types/database.types.ts to exist (run `npm run gen:types`).
 * If you're mocking before provisioning Supabase, temporarily hand-author the
 * aliases in models.ts.
 */

import type {
  Profile,
  Trip,
  TripMember,
  Location,
  Accommodation,
  Activity,
  Transport,
  Todo,
  LocationCostSummary,
  TripCostSummary,
} from "@/types/models";

const now = "2025-05-01T09:00:00.000Z";

// ---------------------------------------------------------------------------
// IDs (stable, human-readable so relationships are easy to trace)
// ---------------------------------------------------------------------------
export const ids = {
  users: {
    admin: "u-admin-ada",
    owner: "u-owner-marco",
    member: "u-member-ibn",
  },
  trips: { italy: "t-italy", japan: "t-japan", norway: "t-norway" },
  locations: {
    rome: "l-rome",
    florence: "l-florence",
    tokyo: "l-tokyo",
    bergen: "l-bergen",
  },
} as const;

// ---------------------------------------------------------------------------
// profiles
// ---------------------------------------------------------------------------
export const profiles: Profile[] = [
  {
    id: ids.users.admin,
    first_name: "Ada",
    last_name: "Lovelace",
    username: "ada",
    email: "ada@zula.app",
    avatar_url: null,
    app_role: "admin",
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.users.owner,
    first_name: "Marco",
    last_name: "Polo",
    username: "marco",
    email: "marco@zula.app",
    avatar_url: null,
    app_role: "user",
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.users.member,
    first_name: "Ibn",
    last_name: "Battuta",
    username: "ibn",
    email: "ibn@zula.app",
    avatar_url: null,
    app_role: "user",
    created_at: now,
    updated_at: now,
  },
];

/** Swap this to test the UI as admin / owner / member during 0.1.0. */
export const currentUser: Profile = profiles[1]; // Marco (owner)

// ---------------------------------------------------------------------------
// trips  (one of each status; all owned by Marco)
// ---------------------------------------------------------------------------
export const trips: Trip[] = [
  {
    id: ids.trips.italy,
    owner_id: ids.users.owner,
    name: "Italy in Summer",
    description: "Rome and Florence over a long week.",
    destination: "Italy",
    start_date: "2025-06-01",
    end_date: "2025-06-08",
    status: "active",
    buffer_cost: 200,
    cover_image_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.japan,
    owner_id: ids.users.owner,
    name: "Japan Cherry Blossoms",
    description: "Tokyo during sakura season.",
    destination: "Japan",
    start_date: "2024-03-25",
    end_date: "2024-03-30",
    status: "completed",
    buffer_cost: 150,
    cover_image_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.norway,
    owner_id: ids.users.owner,
    name: "Norway Fjords",
    description: "Shelved for now.",
    destination: "Norway",
    start_date: "2025-09-10",
    end_date: "2025-09-12",
    status: "archived",
    buffer_cost: 0,
    cover_image_url: null,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// trip_members  (owner auto-added; Ibn is a member of the Italy trip)
// ---------------------------------------------------------------------------
export const tripMembers: TripMember[] = [
  {
    trip_id: ids.trips.italy,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
  {
    trip_id: ids.trips.italy,
    user_id: ids.users.member,
    role: "member",
    created_at: now,
  },
  {
    trip_id: ids.trips.japan,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
  {
    trip_id: ids.trips.norway,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
];

// ---------------------------------------------------------------------------
// locations
// ---------------------------------------------------------------------------
export const locations: Location[] = [
  {
    id: ids.locations.rome,
    trip_id: ids.trips.italy,
    city: "Rome",
    country: "Italy",
    start_date: "2025-06-01",
    end_date: "2025-06-05", // 4 nights
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.locations.florence,
    trip_id: ids.trips.italy,
    city: "Florence",
    country: "Italy",
    start_date: "2025-06-05",
    end_date: "2025-06-08", // 3 nights
    sort_order: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.locations.tokyo,
    trip_id: ids.trips.japan,
    city: "Tokyo",
    country: "Japan",
    start_date: "2024-03-25",
    end_date: "2024-03-30", // 5 nights
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
  {
    // Deliberately has NO accommodation — exercises the optional-object path.
    id: ids.locations.bergen,
    trip_id: ids.trips.norway,
    city: "Bergen",
    country: "Norway",
    start_date: "2025-09-10",
    end_date: "2025-09-12", // 2 nights
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// accommodations  (0..1 per location; Bergen has none)
// ---------------------------------------------------------------------------
export const accommodations: Accommodation[] = [
  {
    id: "a-rome",
    location_id: ids.locations.rome,
    name: "Hotel Colosseo",
    cost_per_night: 120, // x4 nights = 480
    rating: 4.5,
    type: "hotel",
    link: "https://example.com/hotel-colosseo",
    room: "Double, city view",
    created_at: now,
    updated_at: now,
  },
  {
    id: "a-florence",
    location_id: ids.locations.florence,
    name: "Duomo Airbnb",
    cost_per_night: 90, // x3 nights = 270
    rating: 4.7,
    type: "airbnb",
    link: "https://example.com/duomo-airbnb",
    room: "Entire apartment",
    created_at: now,
    updated_at: now,
  },
  {
    id: "a-tokyo",
    location_id: ids.locations.tokyo,
    name: "Shibuya Stay",
    cost_per_night: 100, // x5 nights = 500
    rating: 4.2,
    type: "hotel",
    link: "https://example.com/shibuya-stay",
    room: "Twin",
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// activities  (itinerary items, per location)
// ---------------------------------------------------------------------------
export const activities: Activity[] = [
  {
    id: "act-colosseum",
    location_id: ids.locations.rome,
    name: "Colosseum guided tour",
    cost: 45,
    activity_date: "2025-06-02",
    activity_time: "10:00:00",
    duration_minutes: 120,
    link: "https://example.com/colosseum",
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-vatican",
    location_id: ids.locations.rome,
    name: "Vatican Museums",
    cost: 60,
    activity_date: "2025-06-03",
    activity_time: "09:00:00",
    duration_minutes: 180,
    link: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-uffizi",
    location_id: ids.locations.florence,
    name: "Uffizi Gallery",
    cost: 30,
    activity_date: "2025-06-06",
    activity_time: "11:00:00",
    duration_minutes: 150,
    link: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-teamlab",
    location_id: ids.locations.tokyo,
    name: "teamLab Planets",
    cost: 35,
    activity_date: "2024-03-26",
    activity_time: "13:00:00",
    duration_minutes: 120,
    link: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-fjord",
    location_id: ids.locations.bergen,
    name: "Fjord cruise",
    cost: 75,
    activity_date: "2025-09-11",
    activity_time: "09:30:00",
    duration_minutes: 240,
    link: null,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// transports  (trip-level)
// ---------------------------------------------------------------------------
export const transports: Transport[] = [
  {
    id: "tr-cpt-fco",
    trip_id: ids.trips.italy,
    name: "CPT → Rome (FCO)",
    type: "flight",
    cost: 650,
    duration_minutes: 780,
    start_date: "2025-06-01T07:00:00.000Z",
    end_date: "2025-06-01T20:00:00.000Z",
    start_location_id: null, // CPT is not a trip location
    end_location_id: ids.locations.rome,
    created_at: now,
    updated_at: now,
  },
  {
    id: "tr-rome-florence",
    trip_id: ids.trips.italy,
    name: "Rome → Florence (Frecciarossa)",
    type: "train",
    cost: 45,
    duration_minutes: 95,
    start_date: "2025-06-05T10:00:00.000Z",
    end_date: "2025-06-05T11:35:00.000Z",
    start_location_id: ids.locations.rome,
    end_location_id: ids.locations.florence,
    created_at: now,
    updated_at: now,
  },
  {
    id: "tr-cpt-nrt",
    trip_id: ids.trips.japan,
    name: "CPT → Tokyo (NRT)",
    type: "flight",
    cost: 800,
    duration_minutes: 1140,
    start_date: "2024-03-25T06:00:00.000Z",
    end_date: "2024-03-26T04:00:00.000Z",
    start_location_id: null, // CPT is not a trip location
    end_location_id: ids.locations.tokyo,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// todos  (pre-trip checklist)
// ---------------------------------------------------------------------------
export const todos: Todo[] = [
  {
    id: "todo-passport",
    trip_id: ids.trips.italy,
    title: "Renew passport",
    description: "Expires within 6 months of travel.",
    due_date: "2025-05-01",
    is_complete: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "todo-insurance",
    trip_id: ids.trips.italy,
    title: "Buy travel insurance",
    description: null,
    due_date: "2025-05-20",
    is_complete: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "todo-transfer",
    trip_id: ids.trips.italy,
    title: "Book airport transfer",
    description: "Compare train vs taxi from FCO.",
    due_date: "2025-05-25",
    is_complete: false,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// cost summaries  (stand-ins for the read-only views; precomputed to match)
//   location_total = cost_per_night * nights + sum(activity.cost)
//   trip_total     = sum(location_total) + sum(transport.cost)
// ---------------------------------------------------------------------------
export const locationCostSummaries: LocationCostSummary[] = [
  {
    location_id: ids.locations.rome,
    trip_id: ids.trips.italy,
    accommodation_total: 480,
    activities_total: 105,
    location_total: 585,
  },
  {
    location_id: ids.locations.florence,
    trip_id: ids.trips.italy,
    accommodation_total: 270,
    activities_total: 30,
    location_total: 300,
  },
  {
    location_id: ids.locations.tokyo,
    trip_id: ids.trips.japan,
    accommodation_total: 500,
    activities_total: 35,
    location_total: 535,
  },
  {
    location_id: ids.locations.bergen,
    trip_id: ids.trips.norway,
    accommodation_total: 0,
    activities_total: 75,
    location_total: 75,
  },
];

export const tripCostSummaries: TripCostSummary[] = [
  {
    trip_id: ids.trips.italy,
    locations_total: 885,
    transport_total: 695,
    trip_total: 1580,
  },
  {
    trip_id: ids.trips.japan,
    locations_total: 535,
    transport_total: 800,
    trip_total: 1335,
  },
  {
    trip_id: ids.trips.norway,
    locations_total: 75,
    transport_total: 0,
    trip_total: 75,
  },
];

// ---------------------------------------------------------------------------
// Selectors — mimic the queries your api.ts modules will make against Supabase.
// During 0.1.0 the mock api adapters call these; at 0.2.0 they're swapped for
// real supabase calls and this file is deleted.
// ---------------------------------------------------------------------------
export const selectors = {
  /** RLS-like visibility: admin sees all, others see owned + member trips. */
  visibleTrips(user: Profile = currentUser): Trip[] {
    if (user.app_role === "admin") return trips;
    const memberTripIds = new Set(
      tripMembers.filter((m) => m.user_id === user.id).map((m) => m.trip_id),
    );
    return trips.filter(
      (t) => t.owner_id === user.id || memberTripIds.has(t.id),
    );
  },

  tripById: (tripId: string) => trips.find((t) => t.id === tripId) ?? null,

  membersByTrip: (tripId: string) =>
    tripMembers
      .filter((m) => m.trip_id === tripId)
      .map((m) => ({
        ...m,
        profile: profiles.find((p) => p.id === m.user_id) ?? null,
      })),

  membershipFor: (tripId: string, userId: string = currentUser.id) =>
    tripMembers.find((m) => m.trip_id === tripId && m.user_id === userId) ??
    null,

  locationsByTrip: (tripId: string) =>
    locations
      .filter((l) => l.trip_id === tripId)
      .sort((a, b) => a.sort_order - b.sort_order),

  accommodationByLocation: (locationId: string) =>
    accommodations.find((a) => a.location_id === locationId) ?? null,

  activitiesByLocation: (locationId: string) =>
    activities.filter((a) => a.location_id === locationId),

  transportsByTrip: (tripId: string) =>
    transports.filter((t) => t.trip_id === tripId),

  todosByTrip: (tripId: string) => todos.filter((t) => t.trip_id === tripId),

  locationCost: (locationId: string) =>
    locationCostSummaries.find((s) => s.location_id === locationId) ?? null,

  tripCost: (tripId: string) =>
    tripCostSummaries.find((s) => s.trip_id === tripId) ?? null,
};

/** Aggregate export, handy for a single import in mock api adapters. */
export const mockDb = {
  profiles,
  trips,
  tripMembers,
  locations,
  accommodations,
  activities,
  transports,
  todos,
  locationCostSummaries,
  tripCostSummaries,
  currentUser,
  selectors,
};

export default mockDb;
