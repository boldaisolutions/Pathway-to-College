-- =============================================================================
-- Pathway to College — consolidated migration ("run this now")
-- Paste this whole block into the Supabase SQL editor and click RUN.
-- It is idempotent: safe to run once or many times (IF NOT EXISTS / drop-if-exists).
-- Covers everything added since the initial schema.sql:
--   • résumé summary column        (Résumé)
--   • work_experience table        (Résumé → work experience)
--   • achievements table           (Achievement Bank)
--   • opportunities table          (Opportunity Center)
--   • app_requirements table       (Application Requirements)
--   • recommenders table           (Recommendation Manager)
-- =============================================================================

-- ---------- résumé summary ---------------------------------------------------
alter table students add column if not exists resume_summary text;

-- ---------- work experience --------------------------------------------------
create table if not exists work_experience (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  title       text not null default '',
  employer    text default '',
  location    text default '',
  start_date  text default '',
  end_date    text default '',
  description text default '',
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists work_experience_student_idx on work_experience (student_id);

-- ---------- achievement bank -------------------------------------------------
create table if not exists achievements (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  category     text not null default 'Award',
  title        text not null,
  organization text default '',
  role         text default '',
  result       text default '',
  date         text default '',
  skills       text[] not null default '{}',
  evidence_url text default '',
  created_at   timestamptz not null default now()
);
create index if not exists achievements_student_idx on achievements (student_id);

-- ---------- Opportunity Center ----------------------------------------------
create table if not exists opportunities (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  title       text not null,
  type        text not null default 'Internship',
  org         text default '',
  location    text default '',
  url         text default '',
  deadline    text default '',
  cost        text default '',
  status      text not null default 'Interested',
  notes       text default '',
  created_at  timestamptz not null default now()
);
create index if not exists opportunities_student_idx on opportunities (student_id);

-- ---------- Application Requirements ----------------------------------------
create table if not exists app_requirements (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  college_name text not null default '',
  requirement  text not null,
  category     text not null default 'Other',
  status       text not null default 'Not started',
  due_date     text default '',
  notes        text default '',
  created_at   timestamptz not null default now()
);
create index if not exists app_requirements_student_idx on app_requirements (student_id);

-- ---------- Recommendation Manager ------------------------------------------
create table if not exists recommenders (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  name         text not null,
  role         text not null default 'Teacher',
  relationship text default '',
  email        text default '',
  status       text not null default 'To ask',
  request_date text default '',
  due_date     text default '',
  for_colleges text default '',
  notes        text default '',
  created_at   timestamptz not null default now()
);
create index if not exists recommenders_student_idx on recommenders (student_id);

-- ---------- privileges -------------------------------------------------------
grant select, insert, update, delete on
  work_experience, achievements, opportunities, app_requirements, recommenders
  to anon, authenticated;

-- ---------- row level security ----------------------------------------------
alter table work_experience  enable row level security;
alter table achievements     enable row level security;
alter table opportunities    enable row level security;
alter table app_requirements enable row level security;
alter table recommenders     enable row level security;

drop policy if exists we_select  on work_experience;
drop policy if exists we_write   on work_experience;
create policy we_select on work_experience  for select using (can_view_student(student_id));
create policy we_write  on work_experience  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists ach_select on achievements;
drop policy if exists ach_write  on achievements;
create policy ach_select on achievements    for select using (can_view_student(student_id));
create policy ach_write  on achievements    for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists opp_select on opportunities;
drop policy if exists opp_write  on opportunities;
create policy opp_select on opportunities    for select using (can_view_student(student_id));
create policy opp_write  on opportunities    for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists ar_select on app_requirements;
drop policy if exists ar_write  on app_requirements;
create policy ar_select on app_requirements  for select using (can_view_student(student_id));
create policy ar_write  on app_requirements  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists rcm_select on recommenders;
drop policy if exists rcm_write  on recommenders;
create policy rcm_select on recommenders     for select using (can_view_student(student_id));
create policy rcm_write  on recommenders     for all using (student_id = auth.uid()) with check (student_id = auth.uid());
