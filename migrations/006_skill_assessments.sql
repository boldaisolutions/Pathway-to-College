-- =============================================================================
-- 006 — Skill Gap Analyzer (Testing Center)
-- Paste into the Supabase SQL editor and click RUN. Idempotent.
--
-- Stores diagnostic / practice assessment results (Progress Learning, Bluebook
-- practice tests, Khan Academy, etc.) as percent-correct by PSAT/SAT section
-- and domain, so the app can find skill gaps and build a study order.
--
-- `scores` is a flat map of key -> percent correct (0–100), e.g.
--   { "rw": 74.07, "math": 59, "information_ideas": 50, "craft_structure": 88 }
-- Keys are defined in src/lib/skill-gaps.ts. Missing keys = not reported yet.
-- =============================================================================

create table if not exists skill_assessments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  source      text not null default 'Progress Learning',
  label       text default '',
  taken_on    date,
  scores      jsonb not null default '{}'::jsonb,
  notes       text default '',
  created_at  timestamptz not null default now()
);
create index if not exists skill_assessments_student_idx on skill_assessments (student_id);

alter table skill_assessments enable row level security;

drop policy if exists ska_select on skill_assessments;
drop policy if exists ska_write  on skill_assessments;
create policy ska_select on skill_assessments for select using (can_view_student(student_id));
create policy ska_write  on skill_assessments for all using (student_id = auth.uid()) with check (student_id = auth.uid());
