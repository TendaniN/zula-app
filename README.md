# Zula

<p align="center">
  <img src="src/assets/logo.svg" alt="Zula" width="200" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.4.0-4A9DD4.svg" alt="Version" />
  <img src="https://img.shields.io/badge/status-active%20development-F082A0.svg" alt="Status" />
  <img src="https://img.shields.io/badge/react-19.x-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/typescript-strict-3285BB.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-TBD-lightgrey.svg" alt="License" />
</p>

<p align="center">
  <a href="https://tendanin.github.io/zula/">
    <img src="https://img.shields.io/badge/live-demo-82A895" />
  </a>
</p>

> **Packed bags. Packed itinerary.**

Zula (from the Zulu _izula_, "to wander") is a trip-planning app. Build a trip out of stays, plan what you'll do in each city, track how you'll get around, tick off a pre-trip checklist, and watch the costs add up automatically, then share it with fellow travellers.

---

## Features

- **Trips** with per-trip roles — owner, editor, and viewer — plus a global admin.
- **Stays (locations):** each has a city (required), country, dates, and an **optional accommodation** (name, cost/night, rating, type, link, room).
- **Itinerary:** activities per stay (name, cost, date, time, duration, link, and a category — meal, sightseeing, hike, attraction, …).
- **Transport:** trip-level travel between stays (flight, train, bus, car, ferry, metro).
- **To-dos:** a pre-trip checklist with due dates and completion state.
- **Automatic cost & budget summaries:** read-only totals per stay and per trip, all derived server-side.
- **Savings plan:** a per-category breakdown (accommodation, activities, transport, buffer) where you set a savings window in months per category; the monthly target, amount saved so far, and progress are worked out automatically from the trip's start date. The chosen windows are saved per trip, so they persist and feed the exports.
- **Sharing:** invite travellers to a trip by email as an editor or viewer; the owner manages roles and access.
- **Export** a trip to PDF, PowerPoint, or Excel (itinerary / transport / budget).
- **Search & filter** trips by name/destination and status (`planning` · `active` · `completed` · `archived`); archived trips are hidden by default.
- **Themes:** light, dark, and auto, with a fully responsive, keyboard- and screen-reader-friendly UI.
- **Help & feedback:** an in-app help page with quick-start walkthroughs and a searchable FAQ, plus a feedback form that captures context (page, trip, app version) automatically.

## Roles & permissions

| Role       | Scope of visible trips | What they can do                                                                                          |
| ---------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **Admin**  | Every trip             | Edit any trip, any status                                                                                 |
| **Owner**  | Trips they created     | Full control; edit while `planning`/`active`/`archived`, read-only once `completed` (an admin can reopen) |
| **Editor** | Trips shared with them | Add and change trip content; can't manage members or delete the trip                                      |
| **Viewer** | Trips shared with them | Read-only                                                                                                 |

The `admin` / `user` distinction is a global role on the user's profile; `owner` / `editor` / `viewer` are per-trip roles. Access is enforced in the database via Row Level Security — the frontend mirrors the same rules only to decide which controls to render.

## Tech stack

| Layer      | Choice                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| Language   | TypeScript                                                                                 |
| UI         | React 19 + [Mantine](https://mantine.dev) v9                                               |
| Build/dev  | Vite                                                                                       |
| Routing    | React Router — **Declarative mode** (`<BrowserRouter>` + `<Routes>`)                       |
| State      | [Zustand](https://zustand.docs.pmnd.rs) (client/UI **and** server data via feature stores) |
| Forms      | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) 4                      |
| Dates      | Day.js                                                                                     |
| Onboarding | [driver.js](https://driverjs.com) (guided tour)                                            |
| Exports    | pdfmake (PDF) · pptxgenjs (PPTX) · [ExcelJS](https://github.com/exceljs/exceljs) (XLSX)    |
| Backend    | [Supabase](https://supabase.com) (Postgres + Auth + RLS)                                   |
| Hosting    | GitHub Pages (static SPA, GitHub Actions deploy)                                           |

> **On data fetching:** Zula does not use TanStack Query. Server rows are read and cached in per-feature **Zustand** stores (`tripStore`, `locationStore`, `activityStore`, `transportStore`, `budgetStore`, `feedbackStore`, …) that call `supabase-js` directly. Forms are owned by **TanStack Form** with Zod schemas as the single source of truth for values and validation.

> **On heavy libraries:** the export libraries (pdfmake, pptxgenjs, ExcelJS) and the guided tour (driver.js) are **dynamically imported** at the point of use, so they never load until the user actually exports or starts the tour — keeping the initial bundle small.

> **On XLSX export:** the old `xlsx` (SheetJS) dependency is unmaintained, so Excel export uses **ExcelJS**. It writes a Buffer, which the export utility turns into a Blob download in the browser.

---

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)
- Supabase CLI (for type generation): `npm i -g supabase`

### 1. Install

```bash
git clone <your-repo-url> zula
cd zula
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 3. Set up the database

Open the Supabase SQL editor and run [`zula_schema.sql`](./zula_schema.sql). It creates the enums, tables, RLS policies, cost & budget views, triggers, and indexes. A profile row is created automatically on signup, and the trip owner is auto-added to `trip_members`.

### 4. Generate types

```bash
npm run gen:types   # writes src/types/database.types.ts
```

### 5. Run

```bash
npm run dev
```

---

## Project structure

Routing-first: `pages/` holds one folder per route (each with its own `index.tsx` page and any page-local components), and shared plumbing lives in sibling top-level folders.

```
src/
├── pages/        one folder per route
│   ├── index.tsx      the <Routes> tree (Pages)
│   ├── auth/          login · register · logout
│   ├── trip-list/     "My trips"
│   ├── trip-detail/   a single trip
│   ├── itinerary-list/ a stay's day-by-day itinerary
│   ├── help/          help & support page
│   └── user-profile/  account, preferences, session
├── components/   layouts, access guards, shared UI (buttons, modals, loaders)
├── stores/       Zustand: auth, currency, and per-feature server-data stores
├── schemas/      Zod form schemas (single source of truth for form values)
├── hooks/        usePermissions (RBAC), and other shared hooks
├── lib/          supabase client, dayjs setup
├── types/        generated DB types (database.types.ts) + model aliases
├── utils/        formatting, exports (pdf/pptx/xlsx), permissions, helpers
├── constants/    enums-derived constants (status, budget defaults, …)
└── assets/       logo, wallpapers, help GIFs
```

## Data model

```
profiles ─1─* trips ─*─ profiles          (via trip_members: owner / editor / viewer)
trips    ─1─* locations ─(0..1) accommodations
locations ─1─* activities
trips    ─1─* transports
trips    ─1─* todos
trips    ─1─(0..1) budget_configs          (per-trip savings-plan config)
trips    ─1─* pending_invites              (email invites awaiting sign-in)
feedback                                    (standalone; optional trip/user refs)
```

**`budget_configs`** is the one piece of _stored_ budget state: the savings window (in months) for each category — `accommodation_months`, `activities_months`, `transport_months`, `buffer_months` — one row per trip. It intentionally stores no costs; those come from the views below. Monthly targets and "saved so far" are computed from these months + the view costs + the trip's start date. Writes are owner/admin only via RLS; any trip member can read.

**`pending_invites`** holds email invitations to a trip that haven't been redeemed yet. When the invited person signs in with that email, the invite is converted into a `trip_members` row and marked redeemed.

**`feedback`** is a standalone table: category, message, optional sentiment, and auto-captured context (route, trip, app version, user agent). Anyone can insert; only admins can read.

**Cost & budget summaries** are read-only Postgres views, not stored data:

- `location_cost_summary`: `cost_per_night × nights + Σ activity costs`, plus an activity count per location
- `trip_cost_summary`: `Σ location totals + Σ transport costs`
- `trip_budget_summary`: the budget table: `buffer + accommodation + activities + travel`, split by category, per trip
- `trip_summary`: derived trip start/end dates, distinct `countries[]`, and the budget totals (the row the app maps to its `TripSummary` type)
- `trip_monthly_budget` _(optional)_: server-side monthly split; the export utilities also compute this client-side
- `trip_budget_plan` _(optional)_: joins the saved per-category months from `budget_configs` onto the `trip_summary` costs, so one query returns everything the Budget panel needs

---

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                    |
| `npm run build`     | Type-check and build for production          |
| `npm run preview`   | Preview the production build                 |
| `npm run lint`      | Run ESLint                                   |
| `npm run gen:types` | Regenerate `database.types.ts` from Supabase |

---

## Roadmap

| Milestone    | Outcome                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0.1.0** ✅ | All pages and components built, running on mock data                                                                                               |
| **0.2.0** ✅ | Mock data removed; Supabase auth, RLS, and cost/budget views working                                                                               |
| **0.3.0** ✅ | Theme toggling (light/dark/auto) and full responsiveness complete                                                                                  |
| **0.4.0** 🚧 | _(current)_ Beta-ready: sharing, help pages, feedback, onboarding, and a live GitHub Pages deploy                                                  |
| **0.5.0**    | Hardening & delight: tooling/CI, error logging (Sentry), and traveller features (countdowns, packing lists, departure checklists, calendar export) |
| **1.0.0**    | Beta feedback implemented; ready to expand the user base                                                                                           |

## Deployment

The app deploys as a static SPA to **GitHub Pages** via a GitHub Actions workflow that builds on every push to `master` and publishes the `dist` artifact. Because it's served from a sub-path, the router runs with `basename="zula"` and Vite's `base` is set to `/zula/`. Deployment also needs:

- a client-routing **404 fallback** (`dist/404.html`, a copy of `index.html`) so deep links and refreshes resolve to the SPA;
- the Supabase URL and anon key provided as **repo secrets** to the build;
- the Pages URL added to Supabase's **allowed auth redirect URLs**, or login/signup redirects fail on the live site.

```tsx
<MantineProvider theme={theme}>
  <Notifications />
  <BrowserRouter basename="zula">
    <Pages />
  </BrowserRouter>
</MantineProvider>
```

---

## Contributing

Work is tracked through the milestones and issues above. Each issue's checklist is its acceptance criteria; a milestone is complete when all its issues close.

## 👤 Author

**Tendani Netshitenzhe**
[@TendaniN](https://github.com/TendaniN)
