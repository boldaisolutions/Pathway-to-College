# Running Pathway to College

Production app scaffolded from the handoff docs (`README.md`, `INTEGRATION.md`,
`schema.sql`, `seed.sql`, prototype HTML). Stack: **Next.js 15 (App Router) +
TypeScript + Tailwind + Supabase**.

## What's implemented (milestone 1)

- ✅ Supabase Auth (email/password) with SSR cookie sessions + route middleware
- ✅ Login + the **4-step onboarding wizard** (Account → About you → Academics →
  Activities & goals) writing to `students` + `activities`
- ✅ The **Pathway Score** algorithm (`INTEGRATION.md §3`, ported verbatim into
  `src/lib/pathway-score.ts`) computed server-side, appended to `pathway_scores`,
  with `recommendations` seeded from the bottom-3 categories
- ✅ The **Building** screen, the app shell (250px sidebar + sticky topbar), the
  **Dashboard**, and the **Pathway Score** screen — all reading real rows
- ✅ Design tokens from `README.md` wired into `tailwind.config.ts`; hand-rolled
  SVG charts (hero ring, big ring, radar, trend) ported from the prototype

Later modules (Essay Studio, AI Coach, Roadmap, Activities, Scholarships,
Colleges, etc.) are stubbed in the sidebar as **"Soon"** and come next.

## Setup

### 1. Install

```bash
npm install
```

### 2. Add your keys to `.env.local`

`.env.local` already has your project URL. Fill in the rest from
**Supabase → Settings → API** (and **Settings → Database** for the DB URL):

```
NEXT_PUBLIC_SUPABASE_URL=https://phvunxdokxenebjolazz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # API → Project API keys → anon public
SUPABASE_SERVICE_ROLE_KEY=...            # API → service_role (server only)
ANTHROPIC_API_KEY=...                    # for the AI modules (added later)
SUPABASE_DB_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.phvunxdokxenebjolazz.supabase.co:5432/postgres
```

### 3. Create the schema + seed the catalogs

Either run the helper (needs `SUPABASE_DB_URL`):

```bash
npm run db:setup     # runs schema.sql then seed.sql
```

…or paste `schema.sql` then `seed.sql` into the **Supabase SQL editor**. (DDL
like `create type/table` can't go through the REST/service-role API, which is
why the script uses a direct Postgres connection.)

### 4. (Recommended) Turn off email confirmation for the seamless wizard

**Authentication → Providers → Email → "Confirm email" = off.** The prototype's
onboarding flows straight from signup into the app; with confirmation on, the
wizard shows a "confirm your email" screen and the student finishes onboarding
after logging in. Both paths are handled.

### 5. Run

```bash
npm run dev          # http://localhost:3000
```

Sign up → complete the wizard → **Build my Pathway** computes your score, writes
the first `pathway_scores` snapshot, and drops you on the dashboard.

## Project layout

```
src/
  app/
    page.tsx                 # routes by auth + onboarding state
    login/                   # split-screen login
    signup/                  # 4-step wizard + Build my Pathway (actions.ts)
    auth/callback/           # email-confirm / OAuth code exchange
    (app)/                   # protected shell (sidebar + topbar)
      dashboard/             # hero, stat cards, recs, tasks, deadlines, matches
      pathway/               # big ring, trend, radar, breakdown, strengths/grow
  components/                # Sidebar, Topbar, Charts, Icon, wizard controls
  lib/
    pathway-score.ts         # the scoring algorithm — single source of truth
    supabase/                # browser / server / middleware clients
    queries.ts               # server-side data loaders
    types.ts                 # DB types mirroring schema.sql
scripts/setup-db.mjs         # runs schema.sql + seed.sql
```
