-- =============================================================================
-- Migration 002 — Tier 1 tracking tables
--   Opportunity Center, Application Requirements Tracker, Recommendation Manager
-- Run this ONCE in the Supabase SQL editor (safe to re-run: uses IF NOT EXISTS).
-- =============================================================================

-- ---------- Opportunity Center ----------------------------------------------
-- Internships, summer programs, competitions, research, jobs, volunteering the
-- student is tracking. Feeds the Deadlines dashboard and the résumé/activities.
create table if not exists opportunities (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  title       text not null,
  type        text not null default 'Internship', -- Internship|Summer Program|Competition|Research|Job|Volunteer|Fellowship|Course|Other
  org         text default '',
  location    text default '',
  url         text default '',
  deadline    text default '',                     -- YYYY-MM-DD or free text
  cost        text default '',
  status      text not null default 'Interested',  -- Interested|Applying|Applied|Accepted|Declined
  notes       text default '',
  created_at  timestamptz not null default now()
);
create index if not exists opportunities_student_idx on opportunities (student_id);

-- ---------- Application Requirements Tracker --------------------------------
-- Per-college checklist of what each application needs (essays, recs, forms…).
create table if not exists app_requirements (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  college_name text not null default '',
  requirement  text not null,
  category     text not null default 'Other',      -- Essay|Recommendation|Transcript|Testing|Form|Fee|Portfolio|Interview|Other
  status       text not null default 'Not started', -- Not started|In progress|Done|Waived
  due_date     text default '',
  notes        text default '',
  created_at   timestamptz not null default now()
);
create index if not exists app_requirements_student_idx on app_requirements (student_id);

-- ---------- Recommendation Manager ------------------------------------------
-- Teacher/counselor letters of recommendation: who's writing, status, thank-yous.
create table if not exists recommenders (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  name         text not null,
  role         text not null default 'Teacher',    -- Teacher|Counselor|Coach|Mentor|Employer|Other
  relationship text default '',                     -- e.g. "AP Bio, 11th grade"
  email        text default '',
  status       text not null default 'To ask',      -- To ask|Requested|Confirmed|Submitted|Thank-you sent
  request_date text default '',
  due_date     text default '',
  for_colleges text default '',
  notes        text default '',
  created_at   timestamptz not null default now()
);
create index if not exists recommenders_student_idx on recommenders (student_id);

-- ---------- privileges + RLS -------------------------------------------------
grant select, insert, update, delete on opportunities, app_requirements, recommenders to anon, authenticated;

alter table opportunities     enable row level security;
alter table app_requirements  enable row level security;
alter table recommenders      enable row level security;

drop policy if exists opp_select on opportunities;
drop policy if exists opp_write  on opportunities;
create policy opp_select on opportunities     for select using (can_view_student(student_id));
create policy opp_write  on opportunities     for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists ar_select on app_requirements;
drop policy if exists ar_write  on app_requirements;
create policy ar_select on app_requirements   for select using (can_view_student(student_id));
create policy ar_write  on app_requirements   for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists rcm_select on recommenders;
drop policy if exists rcm_write  on recommenders;
create policy rcm_select on recommenders      for select using (can_view_student(student_id));
create policy rcm_write  on recommenders      for all using (student_id = auth.uid()) with check (student_id = auth.uid());
