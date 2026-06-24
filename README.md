# Handoff: Pathway to College — AI College Planning Platform

## Overview
**Pathway to College** is an AI-powered college planning platform for students in grades 6–12. It centers on a signature **Pathway Score** (a 0–100 competitiveness rating across 9 categories) and an AI College Coach, wrapped in a premium SaaS dashboard. Students sign up, complete a 4-step onboarding wizard, and receive a personalized score, multi-year roadmap, and AI-generated essay ideas + passion projects.

This package lets a developer rebuild the prototype as a real, multi-user product. **Read alongside `schema.sql` (database) and `INTEGRATION.md` (auth, scoring algorithm, AI wiring, data mapping).**

## About the design files
The bundled `Pathway to College.dc.html` (and the inlined `Pathway-prototype-standalone.html` you can open in a browser) are **design references created in HTML** — a working prototype that demonstrates the intended look, layout, and behavior. They are **not production code to copy line-for-line**. The task is to **recreate these designs in a real codebase** using its established patterns. No codebase exists yet, so the recommended environment is **Next.js + TypeScript + Supabase + Tailwind** (see `INTEGRATION.md §1`); adapt freely.

The prototype was authored as a "Design Component" and depends on a runtime (`support.js`) to render — treat it as a visual/behavioral spec, not a module to import.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions. Recreate the UI faithfully using your chosen component library, then connect it to live data per `INTEGRATION.md`. The AI idea-generation flow is already real (calls a model) — only the auth and persistence layers are mocked.

---

## Design tokens

### Color
| Role | Hex |
|---|---|
| Accent / primary | `#4f46e5` (hover `#4338ca`; deep `#3730a3`, `#312e81`) |
| App background | `#faf9f7` (warm off-white) |
| Card / surface | `#ffffff` |
| Borders | `#ececea` (default), `#f0efec` (inner), `#e6e4e0` / `#e2e0db` (inputs) |
| Text | `#1d2129` (primary), `#2c313a`, `#4a4f59`, `#6b7079` (muted), `#868c96` / `#9097a0` / `#9aa0ab` (subtle), `#aab` placeholders |
| Success | `#059669` / `#10b981` / `#047857`; bg `#eafaf1`, `#dcfce7`, `#f0fdf4` |
| Warning | `#d97706` / `#ea580c` / `#c2410c`; bg `#fef0e7`, `#fff7ed` |
| Danger | `#dc2626` / `#ef4444`; bg `#fef2f2` |
| AI / purple | `#7c3aed` / `#6d28d9` / `#5b21b6`; bg `#f3eefe`, `#ede9fe` |
| Avatar (student) | gradient `#fb923c → #ea580c` |
| Indigo tint | bg `#eef0fc`, `#e0e7ff`; text `#4338ca` |

**Pathway category color rule:** score ≥ 75 → `#059669`; ≥ 60 → `#4f46e5`; else `#e8943a`.
**College fit:** Reach → warning orange; Target → indigo; Safety → green.

### Typography
- **UI:** `Plus Jakarta Sans` (400/500/600/700/800).
- **Numeric labels & chart axes:** `JetBrains Mono` (400/500/600).
- Display numbers (scores) 800 weight, letter-spacing `-.02em` to `-.04em`. Section eyebrows: 10–11px, 700, uppercase, letter-spacing `.04–.12em`, color `#9aa0ab`/`#b3b8c0`.

### Radius / shadow / spacing
- Radius: cards `16px`, hero/large `18px`, buttons & inputs `9–10px`, chips `6–8px` (pills `20px`), nav items `9px`.
- Shadow: card `0 1px 2px rgba(16,24,40,.04)`; indigo hero `0 12px 30px -12px rgba(79,70,229,.55)`.
- Layout: page padding `26–28px`; grid gaps `14–18px`; sidebar `250px`; content grids 2–4 columns.
- Entrance animations: `pw-fade` (opacity + 6px translateY, .3s) on view change; `pw-pop` (scale .96→1) on the building screen; `spin` for the loader.

---

## Screens / views

The app is a fixed two-pane shell: **250px sidebar** (logo, nav grouped by the four pillars Overview / Discover / Build / Apply / Manage, "Pathway Pro" upsell) + **main** (sticky topbar: title, search, "On track" pill, notifications, student chip). A `view` state swaps the content region. Before login, three full-screen states replace the shell: **Login**, **Signup wizard**, **Building**.

1. **Login** — split screen: left indigo brand panel (headline + 3 feature rows), right form (email, password, "Log in", "Explore the demo profile", "Create your account" link). Login is cosmetic in the prototype.
2. **Signup wizard** — 4 steps with a progress bar: ① Account (name/email/password) ② About you (grade segmented 6–12, school, intended major, interest chips) ③ Academics (GPA slider, rigor/testing segmented, awards) ④ Activities & goals (activities textarea, leadership, service hours, research toggle, "help with" multi-chips). Footer: Back / Continue / **Build my Pathway**.
3. **Building** — full-screen spinner + rotating checklist while the score computes and AI generates ideas; auto-advances to the dashboard.
4. **Dashboard** — greeting + quick actions; large indigo **Pathway Score** hero (ring + delta + percentile + stats); 4 stat cards; **AI Recommendations** (impact-tagged); **This Week** task list (clickable checkboxes + progress bar); **Upcoming Deadlines**, **Recent Activity** timeline, **Top Matches** scholarships.
5. **Pathway Score** — big score ring + tier; **score-over-time** trend chart (with goal line); **9-axis radar**; per-category breakdown bars; **Strengths** (green) and **Grow next** (amber) panels.
6. **Roadmap** — grades 9–12 columns, each a stack of term milestone cards with done/doing/todo state.
7. **Activities** — filter tabs (All/Leadership/STEM/Service) + activity cards (icon, role, category chip, commitment/since).
8. **Academic Planner** — 4 stat cards + a grade-by-grade course grid with level chips (AP/Honors/Dual/Reg).
9. **Passion Projects** — dark hero CTA + project cards (stage chip, progress bar, milestone checklist). AI-suggested projects appear as stage `Idea`.
10. **Resume** — paper-style document preview (centered header, sectioned entries) + a strength ring and AI tips sidebar + Export PDF.
11. **Essay Studio** — left list of essays (status chip + word progress); main editor (prompt + body); right **Coach feedback** panel (tagged notes). For onboarded users, an "AI essay ideas for you" banner + ideas seeded as `Idea` essays.
12. **Scholarships** — filter pills + 3-up cards (amount, AI match ring, tags, deadline, Save).
13. **College Explorer** — fit tabs (All/Reach/Target/Safety) + college cards (abbr logo, match ring, acceptance %, AI-match note).
14. **Applications** — 3-column pipeline (Researching / Shortlisted / Strong fit) of college cards with match bars.
15. **My Profile** — identity card (avatar, major, interest chips) + stat cards + AI-synthesized **narrative**.
16. **Calendar** — month grid with event dots + "Next up" list.
17. **Settings** — connected **portals** (Parent / Counselor / Mentor / Administrator) with status, account fields, **Log out**.
18. **AI Coach** — chat thread (user/assistant bubbles) + suggested prompts + composer. Scripted in the prototype; see `INTEGRATION.md §4b` for the real streaming version.

## Interactions & behavior
- Sidebar nav and in-card buttons set the `view`; tabs/filters (activities, scholarships, colleges) filter client-side.
- Task and milestone checkboxes toggle state; essay cards select into the editor.
- Onboarding: Continue advances steps; **Build my Pathway** computes the score, shows the Building screen, generates ideas (live AI with deterministic fallback), then enters the app and persists to `localStorage` (replace with Supabase).
- **Log out** clears the session and returns to Login.
- Charts (radar, rings, trend) are hand-rolled SVG in the prototype's logic class (`radarEl`, `heroRingEl`, `bigRingEl`, `ringMini`, `trendEl`) — reuse the math or swap for a chart lib.

## State management
Prototype state (port to server/store): `view`, onboarding `screen`/`step`/`form`, `profile` (computed), `genIdeas` (AI output), plus per-module UI state (`activityTab`, `schFilter`, `collegeTab`, `selectedEssay`, `chat`, `tasks`). In production, identity/score/essays/etc. come from Supabase (see `INTEGRATION.md §5`); only ephemeral UI state stays local.

## Assets
No external images — all iconography is inline SVG (defined in the prototype's `icon()` factory: home, coach, pathway, profile, roadmap, academics, activities, projects, resume, essays, scholarships, colleges, applications, calendar, settings, plus flask/bolt/book/heart/sparkle/users). Avatars are initials on a gradient. Fonts load from Google Fonts.

## Files
- `Pathway to College.dc.html` — the prototype source (Design Component; needs its runtime to render).
- `Pathway-prototype-standalone.html` — self-contained, double-click to open in a browser.
- `schema.sql` — full Postgres schema + Row Level Security + signup trigger.
- `INTEGRATION.md` — stack, auth/onboarding, the Pathway Score algorithm, AI wiring, prototype→table data map, build order.
