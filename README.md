# Zula

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
- **Automatic cost summaries** — read-only totals per stay and per trip.
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

| Layer        | Choice                                             |
|--------------|----------------------------------------------------|
| Language     | TypeScript                                         |
| UI           | React + [Mantine](https://mantine.dev)             |
| Build/dev    | Vite                                               |
| Routing      | React Router                                       |
| Data fetching| TanStack Query                                     |
| Dates        | Day.js                                             |
| Backend      | [Supabase](https://supabase.com) (Postgres + Auth + RLS) |

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
cp .env.local .env
```

```dotenv
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 3. Set up the database

Open the Supabase SQL editor and run [`zula_schema.sql`](./zula_schema.sql).
It creates the enums, tables, RLS policies, cost-summary views, triggers, and
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
self-contained `features/<domain>/` folder (`api.ts` → `hooks.ts` →
`components/` → `pages/`).

```
src/
├── lib/          supabase client, query client, dayjs setup
├── types/        generated DB types + app-facing model aliases
├── providers/    AuthProvider, AppProviders
├── hooks/        useAuth, useTripAccess (RBAC)
├── components/   layout, guards, shared UI
├── features/     auth · trips · locations · activities · transport · todos
├── mocks/        mockData.ts (removed once Supabase is live)
└── utils/        formatting, error handling
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

**Cost summaries** are read-only Postgres views, not stored data:

- `location_cost_summary` — `cost_per_night × nights + Σ activity costs`
- `trip_cost_summary` — `Σ location totals + Σ transport costs`

## Mock data

`src/mocks/mockData.ts` provides a fully-linked dataset for every model, plus
`selectors` that mimic the Supabase queries the real `api.ts` modules will make
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
| **0.2.0** | Mock data removed; Supabase auth, RLS, and cost views working       |
| **0.3.0** | Theme toggling (light/dark/auto) and full responsiveness complete   |
| **0.4.0** | Beta-ready: feedback mechanism, help pages, tooltips, onboarding, published to GitHub Pages |
| **1.0.0** | Beta feedback implemented; ready to expand the user base            |

Detailed milestones and issue checklists are in
[`zula_github_plan.md`](./zula_github_plan.md).

## Deployment

The app deploys as a static SPA to **GitHub Pages** (milestone 0.4.0). This
requires setting Vite's `base` path, a client-routing 404 fallback, a GitHub
Actions build/deploy workflow, and adding the Pages URL to Supabase's allowed
auth redirect URLs.

---

## Contributing

Work is tracked through the milestones and issues above. Each issue's checklist
is its acceptance criteria; a milestone is complete when all its issues close.

## License

Add a license (e.g. MIT) before making the repository public.
