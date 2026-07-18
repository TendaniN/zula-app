# Zula
<p align="center">
  <img src="src/assets/logo.svg" alt="Zula" width="200" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.0-4A9DD4.svg" alt="Version" />
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

Zula (from the Zulu *izula*, "to wander") is a trip-planning app. Build a trip
out of stays, plan what you'll do in each city, track how you'll get around,
tick off a pre-trip checklist, and watch the costs add up automatically — then
share it with fellow travellers.

---

## Features

- **Trips** with three access roles — admin, owner, and member.
- **Stays (locations)** — each has a city (required), country, dates, and an
  **optional accommodation** (name, cost/night, rating, type, link, room).
- **Itinerary** — activities per stay (name, cost, date, time, duration, link).
- **Transport** — trip-level travel between stays (flight, train, metro, …).
- **To-dos** — a pre-trip checklist with due dates and completion state.
- **Automatic cost & budget summaries** — read-only totals per stay and per
  trip, plus a per-category budget breakdown you can plan monthly.
- **Export** a trip to PDF, PowerPoint, or Excel (itinerary / transport / budget).
- **Search & filter** trips by name/destination and status; archived trips are
  hidden by default.

## Roles & permissions

| Role       | Scope of visible trips        | Detail mode                                   |
|------------|-------------------------------|-----------------------------------------------|
| **Admin**  | Every trip                    | Editable                                      |
| **Owner**  | Trips they created            | Editable while `active`; read-only if `completed` |
| **Member** | Trips they belong to          | Always read-only, regardless of status        |

The `admin` / `user` distinction is a global role on the user's profile; the
`owner` / `member` distinction is per-trip. Access is enforced in the database
via Row Level Security — the frontend mirrors the same rules only to decide
which controls to render.

## Tech stack

| Layer         | Choice                                                    |
|---------------|-----------------------------------------------------------|
| Language      | TypeScript                                                |
| UI            | React + [Mantine](https://mantine.dev)                    |
| Build/dev     | Vite                                                      |
| Routing       | React Router — **Declarative mode** (`<BrowserRouter>` + `<Routes>`) |
| State         | [Zustand](https://zustand.docs.pmnd.rs) (client/UI **and** server data via feature stores) |
| Forms         | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) |
| Dates         | Day.js                                                    |
| Exports       | pdfmake (PDF) · pptxgenjs (PPTX) · [ExcelJS](https://github.com/exceljs/exceljs) (XLSX) |
| Backend       | [Supabase](https://supabase.com) (Postgres + Auth + RLS)  |

> **On data fetching:** Zula does not use TanStack Query. Server rows are read
> and cached in per-feature **Zustand** stores (`locationStore`, `activityStore`,
> `travelStore`, …) that call `supabase-js` directly. Forms are owned by
> **TanStack Form** with Zod schemas as the single source of truth for values
> and validation.

> **On XLSX export:** the old `xlsx` (SheetJS) dependency is unmaintained, so
> Excel export uses **ExcelJS**. It writes a Buffer, which the export utility
> turns into a Blob download in the browser.

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

Open the Supabase SQL editor and run [`zula_schema.sql`](./zula_schema.sql).
It creates the enums, tables, RLS policies, cost & budget views, triggers, and
indexes. A profile row is created automatically on signup, and the trip owner
is auto-added to `trip_members`.

### 4. Generate types

```bash
npm run gen:types   # writes src/types/database.types.ts
```

### 5. Run

```bash
npm run dev
```

> **Building UI before wiring the backend?** The app can run entirely on
> [`mockData.ts`](./mockData.ts) during early development — see
> [Mock data](#mock-data) below.

---

## Project structure

Feature-first: shared plumbing lives at the top of `src/`, and each domain is a
self-contained `features/<domain>/` folder (`api.ts` → `store.ts` →
`components/` → `pages/`).

```
src/
├── lib/          supabase client, dayjs setup
├── types/        generated DB types + app-facing model aliases
├── stores/       Zustand: auth, ui/filters, and per-feature server-data stores
├── hooks/        useAuth, useTripAccess (RBAC)
├── components/   layout, guards, form field adapters, shared UI
├── features/     auth · trips · locations · activities · transport · todos · budget
├── mocks/        mockData.ts (removed once Supabase is live)
└── utils/        formatting, error handling, export (pdf/pptx/xlsx)
```

The full breakdown, including key file implementations, is in
[`zula_project_structure.md`](./zula_project_structure.md).

## Data model

```
profiles ─1─* trips ─*─ profiles          (via trip_members: owner / member)
trips    ─1─* locations ─(0..1) accommodations
locations ─1─* activities
trips    ─1─* transports
trips    ─1─* todos
```

**Cost & budget summaries** are read-only Postgres views, not stored data:

- `location_cost_summary` — `cost_per_night × nights + Σ activity costs`
- `trip_cost_summary` — `Σ location totals + Σ transport costs`
- `trip_budget_summary` — the budget table: `buffer + accommodation + activities
  + travel`, split by category, per trip
- `trip_summary` — derived trip start/end dates, distinct `countries[]`, and the
  budget totals (the row the app maps to its `TripSummary` type)
- `trip_monthly_budget` *(optional)* — server-side monthly split; the export
  utilities also compute this client-side

## Mock data

`src/mocks/mockData.ts` provides a fully-linked dataset for every model, plus
`selectors` that mimic the Supabase queries the real feature stores will make
(including an RLS-like `visibleTrips`). Swap `currentUser` to preview the app as
an admin, owner, or member. The mock layer is deleted in milestone **0.2.0**
once Supabase flows are working.

---

## Scripts

| Script              | Description                                  |
|---------------------|----------------------------------------------|
| `npm run dev`       | Start the Vite dev server                    |
| `npm run build`     | Type-check and build for production          |
| `npm run preview`   | Preview the production build                 |
| `npm run gen:types` | Regenerate `database.types.ts` from Supabase |

---

## Roadmap

| Milestone | Outcome                                                              |
|-----------|---------------------------------------------------------------------|
| **0.1.0** | All pages and components built, running on mock data                |
| **0.2.0** | Mock data removed; Supabase auth, RLS, and cost/budget views working |
| **0.3.0** | Theme toggling (light/dark/auto) and full responsiveness complete   |
| **0.4.0** | Beta-ready: feedback mechanism, help pages, tooltips, onboarding, published to GitHub Pages |
| **1.0.0** | Beta feedback implemented; ready to expand the user base            |

Detailed milestones and issue checklists are in
[`zula_github_plan.md`](./zula_github_plan.md).

## Deployment

The app deploys as a static SPA to **GitHub Pages** (milestone 0.4.0). Because
it's served from a sub-path, the router runs with `basename="/zula"` and Vite's
`base` is set to `/zula/`. This also needs a client-routing 404 fallback, a
GitHub Actions build/deploy workflow, and the Pages URL added to Supabase's
allowed auth redirect URLs.

```tsx
<MantineProvider theme={theme}>
  <Notifications />
  <BrowserRouter basename="/zula">
    <Pages />
  </BrowserRouter>
</MantineProvider>
```

---

## Contributing

Work is tracked through the milestones and issues above. Each issue's checklist
is its acceptance criteria; a milestone is complete when all its issues close.

## 👤 Author

**Tendani Netshitenzhe**
[@TendaniN](https://github.com/TendaniN)
