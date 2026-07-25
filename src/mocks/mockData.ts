/**
 * src/mocks/mockData.ts
 *
 * Fully-linked mock dataset for Zula. All records use the shapes from
 * src/types/models.ts and the same string formats Supabase/PostgREST returns:
 *   - date        -> 'YYYY-MM-DD'
 *   - timestamptz -> ISO 8601 (with time + offset)
 *   - time        -> 'HH:MM:SS'
 *
 * trip_status enum: planning | active | completed | archived
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
  TripSummaryRow,
} from "@/types/models";

const now = "2025-05-01T09:00:00.000Z";

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------
export const ids = {
  users: {
    admin: "u-admin-ada",
    owner: "u-owner-marco",
    member: "u-member-ibn",
    guest: "u-guest-fatima",
  },
  trips: {
    italy: "t-italy",
    japan: "t-japan",
    norway: "t-norway",
    portugal: "t-portugal",
    greece: "t-greece",
  },
  locations: {
    rome: "l-rome",
    florence: "l-florence",
    tokyo: "l-tokyo",
    bergen: "l-bergen",
    lisbon: "l-lisbon",
    santorini: "l-santorini",
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
  {
    id: ids.users.guest,
    first_name: "Fatima",
    last_name: "Al-Fihri",
    username: "fatima",
    email: "fatima@zula.app",
    avatar_url: null,
    app_role: "user",
    created_at: now,
    updated_at: now,
  },
];

export const currentUser: Profile = profiles[1]; // Marco (owner)

// ---------------------------------------------------------------------------
// trips — one of each status (planning × 2, active, completed, archived)
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
    description: "Shelved for now — maybe next year.",
    destination: "Norway",
    start_date: "2025-09-10",
    end_date: "2025-09-12",
    status: "archived",
    buffer_cost: 0,
    cover_image_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.portugal,
    owner_id: ids.users.owner,
    name: "Lisbon & the Algarve",
    description: "Coast, tiles, and pastéis de nata.",
    destination: "Portugal",
    start_date: "2025-10-05",
    end_date: "2025-10-14",
    status: "planning",
    buffer_cost: 300,
    cover_image_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.greece,
    owner_id: ids.users.owner,
    name: "Greek Island Hop",
    description: "Santorini and a few quieter spots.",
    destination: "Greece",
    start_date: "2026-05-01",
    end_date: "2026-05-12",
    status: "planning",
    buffer_cost: 250,
    cover_image_url: null,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// trip_members
// ---------------------------------------------------------------------------
export const tripMembers: TripMember[] = [
  // Italy — Marco (owner) + Ibn + Fatima
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
    trip_id: ids.trips.italy,
    user_id: ids.users.guest,
    role: "member",
    created_at: now,
  },
  // Japan — Marco only
  {
    trip_id: ids.trips.japan,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
  // Norway — Marco only
  {
    trip_id: ids.trips.norway,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
  // Portugal — Marco + Ibn
  {
    trip_id: ids.trips.portugal,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
  {
    trip_id: ids.trips.portugal,
    user_id: ids.users.member,
    role: "member",
    created_at: now,
  },
  // Greece — Marco + Fatima
  {
    trip_id: ids.trips.greece,
    user_id: ids.users.owner,
    role: "owner",
    created_at: now,
  },
  {
    trip_id: ids.trips.greece,
    user_id: ids.users.guest,
    role: "member",
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
  {
    id: ids.locations.lisbon,
    trip_id: ids.trips.portugal,
    city: "Lisbon",
    country: "Portugal",
    start_date: "2025-10-05",
    end_date: "2025-10-14", // 9 nights
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.locations.santorini,
    trip_id: ids.trips.greece,
    city: "Santorini",
    country: "Greece",
    start_date: "2026-05-01",
    end_date: "2026-05-12", // 11 nights
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// accommodations (0..1 per location; Bergen has none)
// ---------------------------------------------------------------------------
export const accommodations: Accommodation[] = [
  {
    id: "a-rome",
    location_id: ids.locations.rome,
    name: "Hotel Colosseo",
    cost_per_night: 120, // × 4 = 480
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
    cost_per_night: 90, // × 3 = 270
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
    cost_per_night: 100, // × 5 = 500
    rating: 4.2,
    type: "hotel",
    link: "https://example.com/shibuya-stay",
    room: "Twin",
    created_at: now,
    updated_at: now,
  },
  {
    id: "a-lisbon",
    location_id: ids.locations.lisbon,
    name: "Alfama Guesthouse",
    cost_per_night: 85, // × 9 = 765
    rating: 4.6,
    type: "guesthouse",
    link: "https://example.com/alfama",
    room: "Double en-suite",
    created_at: now,
    updated_at: now,
  },
  {
    id: "a-santorini",
    location_id: ids.locations.santorini,
    name: "Caldera View Suites",
    cost_per_night: 210, // × 11 = 2310
    rating: 4.9,
    type: "hotel",
    link: "https://example.com/caldera",
    room: "Cave suite, sea view",
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// activities
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
  {
    id: "act-sintra",
    location_id: ids.locations.lisbon,
    name: "Day trip to Sintra",
    cost: 40,
    activity_date: "2025-10-08",
    activity_time: "09:00:00",
    duration_minutes: 480,
    link: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-fado",
    location_id: ids.locations.lisbon,
    name: "Fado dinner show",
    cost: 65,
    activity_date: "2025-10-10",
    activity_time: "20:00:00",
    duration_minutes: 150,
    link: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-oia",
    location_id: ids.locations.santorini,
    name: "Oia sunset walk",
    cost: 0,
    activity_date: "2026-05-03",
    activity_time: "18:30:00",
    duration_minutes: 90,
    link: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "act-volcano",
    location_id: ids.locations.santorini,
    name: "Volcanic island boat tour",
    cost: 55,
    activity_date: "2026-05-05",
    activity_time: "10:00:00",
    duration_minutes: 300,
    link: null,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// transports
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
    start_location_id: null,
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
    start_location_id: null,
    end_location_id: ids.locations.tokyo,
    created_at: now,
    updated_at: now,
  },
  {
    id: "tr-cpt-lis",
    trip_id: ids.trips.portugal,
    name: "CPT → Lisbon (LIS)",
    type: "flight",
    cost: 580,
    duration_minutes: 660,
    start_date: "2025-10-05T06:30:00.000Z",
    end_date: "2025-10-05T17:30:00.000Z",
    start_location_id: null,
    end_location_id: ids.locations.lisbon,
    created_at: now,
    updated_at: now,
  },
  {
    id: "tr-cpt-jtr",
    trip_id: ids.trips.greece,
    name: "CPT → Santorini (JTR)",
    type: "flight",
    cost: 720,
    duration_minutes: 840,
    start_date: "2026-05-01T05:00:00.000Z",
    end_date: "2026-05-01T19:00:00.000Z",
    start_location_id: null,
    end_location_id: ids.locations.santorini,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// todos
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
    id: "todo-portugal-visa",
    trip_id: ids.trips.portugal,
    title: "Check visa requirements",
    description: null,
    due_date: "2025-08-01",
    is_complete: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "todo-portugal-flights",
    trip_id: ids.trips.portugal,
    title: "Book return flights",
    description: null,
    due_date: "2025-07-15",
    is_complete: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "todo-greece-ferry",
    trip_id: ids.trips.greece,
    title: "Research ferry options",
    description: "Athens to Santorini as a backup to flying.",
    due_date: "2026-02-01",
    is_complete: false,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// cost summaries (precomputed to match the data above)
//   location_total = cost_per_night × nights + sum(activity.cost)
//   trip_total     = sum(location_total) + sum(transport.cost)
// ---------------------------------------------------------------------------
export const locationCostSummaries: LocationCostSummary[] = [
  // Italy
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
  // Japan
  {
    location_id: ids.locations.tokyo,
    trip_id: ids.trips.japan,
    accommodation_total: 500,
    activities_total: 35,
    location_total: 535,
  },
  // Norway
  {
    location_id: ids.locations.bergen,
    trip_id: ids.trips.norway,
    accommodation_total: 0,
    activities_total: 75,
    location_total: 75,
  },
  // Portugal: 765 acc + 105 activities
  {
    location_id: ids.locations.lisbon,
    trip_id: ids.trips.portugal,
    accommodation_total: 765,
    activities_total: 105,
    location_total: 870,
  },
  // Greece: 2310 acc + 55 activities (oia sunset is free)
  {
    location_id: ids.locations.santorini,
    trip_id: ids.trips.greece,
    accommodation_total: 2310,
    activities_total: 55,
    location_total: 2365,
  },
];

export const tripCostSummaries: TripCostSummary[] = [
  // Italy: 885 locations + 695 transport + 200 buffer = 1780
  {
    trip_id: ids.trips.italy,
    locations_total: 885,
    transport_total: 695,
    trip_total: 1780,
  },
  // Japan: 535 + 800 + 150 buffer = 1485
  {
    trip_id: ids.trips.japan,
    locations_total: 535,
    transport_total: 800,
    trip_total: 1485,
  },
  // Norway: 75 + 0 + 0 buffer = 75
  {
    trip_id: ids.trips.norway,
    locations_total: 75,
    transport_total: 0,
    trip_total: 75,
  },
  // Portugal: 870 + 580 + 300 buffer = 1750
  {
    trip_id: ids.trips.portugal,
    locations_total: 870,
    transport_total: 580,
    trip_total: 1750,
  },
  // Greece: 2365 + 720 + 250 buffer = 3335
  {
    trip_id: ids.trips.greece,
    locations_total: 2365,
    transport_total: 720,
    trip_total: 3335,
  },
];

// ---------------------------------------------------------------------------
// trip_summaries — mirrors the trip_summary view (all columns nullable per
// PostgREST views). Costs match tripCostSummaries above.
// ---------------------------------------------------------------------------
export const tripSummaries: TripSummaryRow[] = [
  {
    id: ids.trips.italy,
    owner_id: ids.users.owner,
    name: "Italy in Summer",
    description: "Rome and Florence over a long week.",
    destination: "Italy",
    status: "active",
    cover_image_url: null,
    start_date: "2025-06-01",
    end_date: "2025-06-08",
    countries: ["Italy"],
    buffer_cost: 200,
    accommodation_cost: 750, // 480 (Rome) + 270 (Florence)
    activities_cost: 135, // 105 (Rome) + 30 (Florence)
    travel_cost: 695, // CPT→FCO + Rome→Florence train
    total_cost: 1780,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.japan,
    owner_id: ids.users.owner,
    name: "Japan Cherry Blossoms",
    description: "Tokyo during sakura season.",
    destination: "Japan",
    status: "completed",
    cover_image_url: null,
    start_date: "2024-03-25",
    end_date: "2024-03-30",
    countries: ["Japan"],
    buffer_cost: 150,
    accommodation_cost: 500,
    activities_cost: 35,
    travel_cost: 800,
    total_cost: 1485,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.norway,
    owner_id: ids.users.owner,
    name: "Norway Fjords",
    description: "Shelved for now — maybe next year.",
    destination: "Norway",
    status: "archived",
    cover_image_url: null,
    start_date: "2025-09-10",
    end_date: "2025-09-12",
    countries: ["Norway"],
    buffer_cost: 0,
    accommodation_cost: 0,
    activities_cost: 75,
    travel_cost: 0,
    total_cost: 75,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.portugal,
    owner_id: ids.users.owner,
    name: "Lisbon & the Algarve",
    description: "Coast, tiles, and pastéis de nata.",
    destination: "Portugal",
    status: "planning",
    cover_image_url: null,
    start_date: "2025-10-05",
    end_date: "2025-10-14",
    countries: ["Portugal"],
    buffer_cost: 300,
    accommodation_cost: 765,
    activities_cost: 105, // Sintra 40 + Fado 65
    travel_cost: 580,
    total_cost: 1750,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.trips.greece,
    owner_id: ids.users.owner,
    name: "Greek Island Hop",
    description: "Santorini and a few quieter spots.",
    destination: "Greece",
    status: "planning",
    cover_image_url: null,
    start_date: "2026-05-01",
    end_date: "2026-05-12",
    countries: ["Greece"],
    buffer_cost: 250,
    accommodation_cost: 2310,
    activities_cost: 55, // Oia sunset (free) + volcano tour 55
    travel_cost: 720,
    total_cost: 3335,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectors = {
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

  tripSummaryById: (tripId: string) =>
    tripSummaries.find((s) => s.id === tripId) ?? null,

  allTripSummaries: () => tripSummaries,
};

export const mockDb = {
  profiles,
  trips,
  tripSummaries,
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
