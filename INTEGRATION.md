# Integration Plan — Pathway to College

How to turn the HTML prototype into a real, multi-user app backed by **Supabase** (auth + Postgres) and shipped from **GitHub**. This file is the bridge between the prototype's in-memory data and real tables/queries. Pair it with `schema.sql`.

---

## 1. Recommended stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | First-class Supabase auth (SSR cookies), API routes for the AI calls, easy Vercel deploy. (Vite + React SPA also fine if you prefer — then put AI calls behind a small serverless function.) |
| Styling | Tailwind **or** keep the prototype's inline-style values | All design tokens are listed in `README.md`. The prototype uses plain inline styles; port them to your system. |
| Data/auth | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) | Postgres + Row Level Security + Auth + Storage in one. |
| Charts | Recharts / visx, or port the prototype's hand-rolled SVG (radar, ring, trend) | The SVG math is in the prototype's logic class — see `radarEl`, `heroRingEl`, `trendEl`. |
| AI | Anthropic API (`claude-haiku-4-5`) via a **server** route | Never expose the key client-side. |
| Deploy | Vercel or Netlify, repo on GitHub | — |

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server only (seeding catalogs, admin writes)
ANTHROPIC_API_KEY=...                # server only
```

---

## 2. Auth & onboarding flow

The prototype fakes this with `screen` state + localStorage. Real version:

1. **Sign up** (`profiles`/`students` rows are created automatically by the `on_auth_user_created` trigger in `schema.sql`). Pass `full_name` and `role` in `options.data` so the trigger seeds them:
   ```ts
   await supabase.auth.signUp({
     email, password,
     options: { data: { full_name, role: 'student' } }
   });
   ```
2. **Onboarding wizard** (the 4 steps in the prototype: Account → About you → Academics → Activities & goals) writes to `students`:
   ```ts
   await supabase.from('students').update({
     grade, school, intended_major, interests, // text[]
     gpa, rigor, testing, leadership, service_hours, research, awards_count, help_with
   }).eq('id', user.id);
   ```
3. **Build my Pathway** → run the scoring function (§3), insert one `pathway_scores` snapshot, then call the AI route (§4) to generate essay ideas + passion projects + narrative, inserting `essays` (status `Idea`, `ai_origin=true`) and `projects` (stage `Idea`, `ai_origin=true`) and `students.narrative`.
4. Roles other than `student` (parent/counselor/mentor) skip onboarding and instead accept a `relationships` invite to view a linked student.

**Onboarding field → column map**

| Wizard field | Column on `students` |
|---|---|
| Full name / email / password | `auth.users` + `profiles.full_name` (via trigger) |
| Current grade (6–12) | `grade` |
| School | `school` |
| Intended major or field | `intended_major` |
| Interests (chips) | `interests text[]` |
| Weighted GPA (slider) | `gpa numeric(3,2)` |
| Honors/AP/IB taken (None/A few/Many) | `rigor` enum (`none`/`some`/`many`) |
| Standardized testing | `testing` enum (`notyet`/`psat`/`taken`) |
| Awards/honors count | `awards_count` |
| Activities (one per line) | rows in `activities` (split textarea, `guessCat` for `category`) |
| Leadership (Not yet/Member/Leadership role) | `leadership` enum (`none`/`member`/`leader`) |
| Service hours | `service_hours` |
| Research? | `research boolean` |
| What do you want help with? | `help_with text[]` |

---

## 3. Pathway Score algorithm (single source of truth)

This is the exact logic from the prototype's `computeProfile()`. Implement it once — ideally a **Supabase Edge Function** or a server action called `computePathwayScore(student)` — so the score is recomputed server-side whenever inputs change, and a new `pathway_scores` row is appended (the trend chart reads the history).

```ts
const clamp = (n: number) => Math.max(10, Math.min(99, Math.round(n)));

function computeCategories(s: StudentInputs) {
  const actCount = s.activities.length;
  return [
    { name:'Academic Performance', short:'Academics',  score: clamp((s.gpa - 2) / 2 * 100),          note:`GPA ${s.gpa}` },
    { name:'Course Rigor',         short:'Rigor',       score: ({none:42,some:68,many:88})[s.rigor],   note:'' },
    { name:'Standardized Testing', short:'Testing',     score: ({notyet:46,psat:66,taken:85})[s.testing], note:'' },
    { name:'Leadership',           short:'Leadership',  score: ({none:42,member:60,leader:84})[s.leadership], note:'' },
    { name:'Extracurricular Depth',short:'Activities',  score: clamp(40 + actCount * 9),               note:`${actCount} activities` },
    { name:'Community Impact',     short:'Service',     score: clamp(40 + (s.service_hours||0) / 3),   note:`${s.service_hours} hrs` },
    { name:'Research',             short:'Research',    score: s.research ? 84 : 42,                    note: s.research?'yes':'none yet' },
    { name:'Awards & Honors',      short:'Awards',      score: clamp(44 + (s.awards_count||0) * 12),    note:`${s.awards_count} awards` },
    { name:'Personal Narrative',   short:'Narrative',   score: clamp(54 + (s.intended_major?10:0) + (s.interests.length>=3?8:0)), note:'developing' },
  ];
}

const WEIGHTS = { Academics:.18, Rigor:.12, Testing:.10, Leadership:.10,
                  Activities:.12, Service:.10, Research:.12, Awards:.08, Narrative:.08 };

function overallScore(cats) {
  return clamp(cats.reduce((a, c) => a + c.score * WEIGHTS[c.short], 0));
}

function tierFor(overall: number) {
  return overall < 50 ? 'Getting started'
       : overall < 65 ? 'Building foundation'
       : overall < 75 ? 'Building momentum'
       : overall < 85 ? 'Highly competitive'
       : 'Elite tier';
}

const percentile = (overall) => Math.max(2, Math.min(60, Math.round((100 - overall) * 0.8)));
```

- **Strengths** = top 3 categories by score (mapped to friendly copy).
- **Improvements / Recommendations** = bottom 3 categories, each → `{ title, why, impact:'+6'|'+4'|'+3', icon }` inserted into `recommendations`.
- **Trend** = `select overall, computed_at from pathway_scores where student_id=… order by computed_at`.
- The category→color rule used throughout the UI: `score >= 75 → #059669`, `>= 60 → #4f46e5`, else `#e8943a`.

(The full strength/improvement copy maps and `guessCat()` keyword rules are in the prototype's logic class — copy them verbatim.)

---

## 4. AI features (server-side)

The prototype calls a browser helper `window.claude.complete(...)`. In production, move this behind an API route that holds `ANTHROPIC_API_KEY`.

### 4a. Idea generation (essays + passion projects + narrative)
Used by **Build my Pathway** and re-runnable from the dashboard. Same prompt as the prototype's `ideaPrompt()`:

```
You are an expert U.S. college admissions strategist. Profile of a grade {grade} student.
Name: {name}. Intended major: {major}. Interests: {interests}.
GPA: {gpa}. Activities: {acts}. Leadership: {leadership}. Service hours: {hours}. Research: {research}.
They want help with: {helpWith}.
Respond with ONLY valid minified JSON, no markdown, exactly this shape:
{"strategy":"...","essayIdeas":[{"title":"","angle":""}],"passionProjects":[{"name":"","description":"","impact":""}]}
Give exactly 3 essayIdeas and 3 passionProjects tailored to THIS student. Keep each field under 28 words.
```
Parse with `raw.match(/\{[\s\S]*\}/)` → `JSON.parse`. **Always keep the deterministic fallback** (`fallbackIdeas()` in the prototype) so onboarding never dead-ends if the model fails. Persist:
- `strategy` → `students.narrative`
- each `essayIdeas[i]` → `essays` row (`status='Idea'`, `ai_origin=true`, `prompt=angle`)
- each `passionProjects[i]` → `projects` row (`stage='Idea'`, `ai_origin=true`) + 4 default `project_milestones`

### 4b. AI Coach chat
Streaming chat backed by `coach_messages`. Build the system prompt from the student's live profile (score, category gaps, activities) so advice is grounded. Persist every user + assistant turn. The prototype's `cannedReply()` shows the intended tone and the four canned topics (research, score, junior-year plan, projects) — use them as few-shot guidance, not hardcoded answers.

### 4c. Essay feedback
"Get full review" → send the essay `body` + `prompt`, return tagged notes (`Strong`/`Develop`/`Watch`), insert into `essay_feedback`.

---

## 5. Prototype data → table/query map

Each key the prototype's `renderVals()` returns, and where it comes from in production:

| Prototype data | Source table / query |
|---|---|
| `student` (name, grade, school, major…) | `profiles` ⨝ `students` for `auth.uid()` |
| `pathwayScore`, `pathwayTier`, `percentile`, `categories`, `strengths`, `improvements` | latest `pathway_scores` row |
| `history` (trend) | `pathway_scores` ordered by `computed_at` |
| `recommendations` | `recommendations where not dismissed` |
| `tasks` | `tasks` |
| `deadlines` | `deadlines where student_id = me or student_id is null` order by `due_date` |
| `recentActivity` | audit/event log (add a `events` table, or derive) |
| `scholarshipsMini`, `filteredScholarships` | `scholarships` ⨝ `saved_scholarships`; match = AI |
| `filteredActivities`, `activityTabs` | `activities` (filter by `category`) |
| `essays`, `activeEssay` | `essays` ⨝ `essay_feedback` |
| `projects` | `projects` ⨝ `project_milestones` |
| `filteredColleges`, `appColumns` | `colleges` ⨝ `college_list` (group by `stage` for the pipeline) |
| `roadmapYears` | `roadmap_milestones` grouped by `grade` |
| `coursePlan`, `acadStats` | `courses` grouped by `grade`; GPA/rigor derived from `students` |
| `chat` | `coach_messages` |
| `portals`, `accountFields` | `relationships`, `profiles`/`students` |

---

## 6. Realtime, storage, polish (optional but recommended)
- **Realtime**: subscribe to `coach_messages` and `pathway_scores` so the Coach and score update live.
- **Storage**: a `resumes` / `portfolios` bucket for PDF export and the Portfolio Website Builder.
- **Scheduled**: a cron Edge Function to refresh scholarship/deadline matches.
- **Seeding**: load the `scholarships` and `colleges` catalogs with the service-role key (the prototype's `schRaw` / `colRaw` arrays are good seed data to start).

---

## 7. What's mock vs real right now

| Area | Prototype | Production target |
|---|---|---|
| Login | any credentials work, no session | Supabase Auth (email + OAuth), SSR session |
| Persistence | `localStorage` only, one browser | Postgres + RLS, cross-device |
| Pathway Score | computed in-browser | server function → `pathway_scores` (auditable history) |
| Essay/Project ideas | live model via browser helper, browser-stored | server route + persisted rows |
| Coach chat | scripted `cannedReply()` | streaming Anthropic + `coach_messages` |
| Scholarships/colleges | hardcoded arrays | seeded catalogs + AI matching |
| Parent/Counselor/Mentor portals | static UI in Settings | `relationships` + RLS read access |

---

## 8. Suggested build order
1. Supabase project + run `schema.sql`; wire Auth + the signup trigger.
2. Onboarding wizard → write `students`; implement `computePathwayScore` (§3) + first snapshot.
3. Dashboard + Pathway Score reading real rows.
4. AI route (§4a) for idea generation; Essay Studio + Projects from DB.
5. Activities, Academic Planner, Roadmap CRUD.
6. Scholarships/Colleges catalogs + saving + AI match.
7. Coach chat (§4b) with realtime.
8. Relationships/portals + RLS verification (log in as each role).
9. Deploy to Vercel from GitHub.
