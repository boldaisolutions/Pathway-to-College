-- =============================================================================
-- Pathway to College — Supabase / Postgres schema
-- Run in Supabase SQL editor (or as a migration). Requires the auth schema
-- that Supabase provides out of the box (auth.users, auth.uid()).
-- =============================================================================

-- ---------- enums -------------------------------------------------------------
create type user_role        as enum ('student','parent','counselor','mentor','admin');
create type rigor_level      as enum ('none','some','many');
create type testing_state    as enum ('notyet','psat','taken');
create type leadership_level as enum ('none','member','leader');
create type course_level     as enum ('Reg','Honors','AP','IB','Dual');
create type essay_status     as enum ('Idea','Outline','Drafting','In review','Done');
create type project_stage    as enum ('Idea','Planning','Building','Launched');
create type college_fit      as enum ('Reach','Target','Safety');
create type pipeline_stage   as enum ('Researching','Shortlisted','Applying','Submitted');
create type milestone_status as enum ('todo','doing','done');
create type relation_kind    as enum ('parent','counselor','mentor');
create type relation_status  as enum ('invited','pending','connected');

-- ---------- profiles (1:1 with auth.users) -----------------------------------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role   not null default 'student',
  full_name       text        not null default '',
  email           text        not null default '',
  avatar_initials text        generated always as (
                      upper(substr(coalesce(nullif(full_name,''),'S'),1,1))
                    ) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- students (1:1 with a student profile) ----------------------------
-- onboarding self-report lives here; computed scores live in pathway_scores
create table students (
  id              uuid primary key references profiles(id) on delete cascade,
  grade           int          not null default 10 check (grade between 6 and 12),
  class_of        int,
  school          text         not null default '',
  intended_major  text         not null default '',
  location        text         not null default '',
  gpa             numeric(3,2) not null default 3.50 check (gpa between 0 and 5),
  rigor           rigor_level      not null default 'some',
  testing         testing_state    not null default 'notyet',
  leadership      leadership_level not null default 'member',
  service_hours   int          not null default 0,
  research        boolean      not null default false,
  awards_count    int          not null default 0,
  interests       text[]       not null default '{}',
  help_with       text[]       not null default '{}',
  narrative       text,                 -- AI-synthesized story / strategy
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

-- ---------- pathway score snapshots (trend = many rows over time) ------------
-- `categories` holds the 9 category objects: [{name,short,score,note}, ...]
create table pathway_scores (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  overall       int  not null check (overall between 0 and 100),
  tier          text not null,
  percentile    int,
  categories    jsonb not null default '[]',
  strengths     text[] not null default '{}',
  improvements  text[] not null default '{}',
  computed_at   timestamptz not null default now()
);
create index on pathway_scores (student_id, computed_at desc);

-- ---------- activities --------------------------------------------------------
create table activities (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  name        text not null,
  role        text default '',
  category    text default 'STEM',          -- STEM | Leadership | Service | Arts ...
  hours       text default '',              -- free text e.g. "4 hr/wk", "120 hrs"
  since       text default '',
  description text default '',
  created_at  timestamptz not null default now()
);
create index on activities (student_id);

-- ---------- academic course plan ---------------------------------------------
create table courses (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  grade       int  not null,
  name        text not null,
  level       course_level not null default 'Reg',
  term        text default '',
  planned     boolean not null default false   -- true = future plan, false = taken/current
);
create index on courses (student_id, grade);

-- ---------- standardized tests -----------------------------------------------
create table tests (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  kind        text not null,                 -- PSAT | SAT | ACT | AP | IB
  label       text default '',
  score       text default '',
  test_date   date,
  status      text default 'planned'         -- planned | registered | taken
);
create index on tests (student_id);

-- ---------- essays + feedback ------------------------------------------------
create table essays (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  title       text not null,
  status      essay_status not null default 'Idea',
  prompt      text default '',
  body        text default '',
  word_target int  default 650,
  ai_origin   boolean not null default false, -- generated by the Coach
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index on essays (student_id);

create table essay_feedback (
  id         uuid primary key default gen_random_uuid(),
  essay_id   uuid not null references essays(id) on delete cascade,
  tag        text not null,                  -- Strong | Develop | Watch | Tip | Idea
  color      text default '#7c3aed',
  body       text not null,
  created_at timestamptz not null default now()
);
create index on essay_feedback (essay_id);

-- ---------- passion projects + milestones ------------------------------------
create table projects (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  name        text not null,
  stage       project_stage not null default 'Idea',
  progress    int  not null default 0 check (progress between 0 and 100),
  description text default '',
  impact      text default '',
  ai_origin   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on projects (student_id);

create table project_milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  body        text not null,
  done        boolean not null default false,
  position    int not null default 0
);
create index on project_milestones (project_id, position);

-- ---------- scholarships (shared catalog) + saved ----------------------------
create table scholarships (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  amount     text default '',
  deadline   date,
  tags       text[] not null default '{}',
  url        text default ''
);

create table saved_scholarships (
  student_id     uuid not null references students(id) on delete cascade,
  scholarship_id uuid not null references scholarships(id) on delete cascade,
  match          int,                         -- 0..100 AI match score
  status         text default 'saved',        -- saved | applying | submitted
  created_at     timestamptz not null default now(),
  primary key (student_id, scholarship_id)
);

-- ---------- colleges (shared catalog) + a student's list ---------------------
create table colleges (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  abbr            text default '',
  location        text default '',
  acceptance_rate text default ''
);

create table college_list (
  student_id  uuid not null references students(id) on delete cascade,
  college_id  uuid not null references colleges(id) on delete cascade,
  fit         college_fit,
  match       int,                            -- 0..100 AI match
  stage       pipeline_stage not null default 'Researching',
  notes       text default '',
  created_at  timestamptz not null default now(),
  primary key (student_id, college_id)
);

-- ---------- tasks & deadlines ------------------------------------------------
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  body        text not null,
  tag         text default '',
  done        boolean not null default false,
  due_date    date,
  created_at  timestamptz not null default now()
);
create index on tasks (student_id);

create table deadlines (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references students(id) on delete cascade, -- null = global/catalog
  title       text not null,
  org         text default '',
  kind        text default '',                -- Academic | Program | Competition | Scholarship
  due_date    date not null,
  urgent      boolean not null default false
);
create index on deadlines (student_id, due_date);

-- ---------- AI recommendations -----------------------------------------------
create table recommendations (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  title       text not null,
  why         text default '',
  impact      text default '',                -- e.g. "+6"
  category    text default '',                -- maps to a pathway category short name
  icon        text default 'target',
  dismissed   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on recommendations (student_id);

-- ---------- roadmap milestones (grades 6-12) ---------------------------------
create table roadmap_milestones (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  grade       int  not null,
  term        text default '',                -- Fall | Winter | Spring | Summer | Year
  title       text not null,
  detail      text default '',
  status      milestone_status not null default 'todo',
  position    int not null default 0
);
create index on roadmap_milestones (student_id, grade, position);

-- ---------- AI coach messages ------------------------------------------------
create table coach_messages (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index on coach_messages (student_id, created_at);

-- ---------- portals: parent / counselor / mentor links -----------------------
create table relationships (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references students(id) on delete cascade,
  related_profile_id uuid references profiles(id) on delete cascade, -- null until accepted
  invite_email       text,
  relation           relation_kind   not null,
  status             relation_status not null default 'invited',
  created_at         timestamptz not null default now()
);
create index on relationships (student_id);
create index on relationships (related_profile_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- helper: can the current user see this student's data?
--   true if it's the student themself, OR a connected guardian/counselor/mentor.
create or replace function can_view_student(target uuid)
returns boolean language sql security definer stable as $$
  select
    auth.uid() = target
    or exists (
      select 1 from relationships r
      where r.student_id = target
        and r.related_profile_id = auth.uid()
        and r.status = 'connected'
    );
$$;

-- enable RLS everywhere
alter table profiles            enable row level security;
alter table students            enable row level security;
alter table pathway_scores      enable row level security;
alter table activities          enable row level security;
alter table courses             enable row level security;
alter table tests               enable row level security;
alter table essays              enable row level security;
alter table essay_feedback      enable row level security;
alter table projects            enable row level security;
alter table project_milestones  enable row level security;
alter table saved_scholarships  enable row level security;
alter table college_list        enable row level security;
alter table tasks               enable row level security;
alter table deadlines           enable row level security;
alter table recommendations     enable row level security;
alter table roadmap_milestones  enable row level security;
alter table coach_messages      enable row level security;
alter table relationships       enable row level security;
alter table scholarships        enable row level security;
alter table colleges            enable row level security;

-- profiles: read your own; linked viewers can read the student profile too
create policy profiles_self_rw on profiles
  for all using (id = auth.uid() or can_view_student(id))
  with check (id = auth.uid());

-- students: student edits own row; linked viewers read-only
create policy students_owner_rw on students
  for all using (can_view_student(id))
  with check (id = auth.uid());

-- generic owner-or-viewer pattern for student-owned tables.
-- WRITE is restricted to the student; READ allowed to linked viewers.
-- (repeat block per table; student_id column drives ownership)
create policy ps_select on pathway_scores     for select using (can_view_student(student_id));
create policy ps_write  on pathway_scores     for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy act_select on activities        for select using (can_view_student(student_id));
create policy act_write  on activities        for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy crs_select on courses           for select using (can_view_student(student_id));
create policy crs_write  on courses           for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy tst_select on tests             for select using (can_view_student(student_id));
create policy tst_write  on tests             for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy ess_select on essays            for select using (can_view_student(student_id));
create policy ess_write  on essays            for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy esf_select on essay_feedback    for select using (exists (select 1 from essays e where e.id = essay_id and can_view_student(e.student_id)));
create policy esf_write  on essay_feedback    for all using (exists (select 1 from essays e where e.id = essay_id and e.student_id = auth.uid())) with check (exists (select 1 from essays e where e.id = essay_id and e.student_id = auth.uid()));

create policy prj_select on projects          for select using (can_view_student(student_id));
create policy prj_write  on projects          for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy pms_select on project_milestones for select using (exists (select 1 from projects p where p.id = project_id and can_view_student(p.student_id)));
create policy pms_write  on project_milestones for all using (exists (select 1 from projects p where p.id = project_id and p.student_id = auth.uid())) with check (exists (select 1 from projects p where p.id = project_id and p.student_id = auth.uid()));

create policy sav_select on saved_scholarships for select using (can_view_student(student_id));
create policy sav_write  on saved_scholarships for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy cl_select on college_list       for select using (can_view_student(student_id));
create policy cl_write  on college_list       for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy tsk_select on tasks             for select using (can_view_student(student_id));
create policy tsk_write  on tasks             for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy dl_select on deadlines          for select using (student_id is null or can_view_student(student_id));
create policy dl_write  on deadlines          for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy rec_select on recommendations   for select using (can_view_student(student_id));
create policy rec_write  on recommendations   for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy rm_select on roadmap_milestones for select using (can_view_student(student_id));
create policy rm_write  on roadmap_milestones for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy cm_select on coach_messages     for select using (can_view_student(student_id));
create policy cm_write  on coach_messages     for all using (student_id = auth.uid()) with check (student_id = auth.uid());

-- relationships: the student manages invites; the invited party can read/accept theirs
create policy rel_student_rw on relationships
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy rel_viewer_read on relationships
  for select using (related_profile_id = auth.uid());
create policy rel_viewer_accept on relationships
  for update using (related_profile_id = auth.uid()) with check (related_profile_id = auth.uid());

-- shared catalogs: any authenticated user may read; writes are admin/service-role only
create policy sch_read on scholarships for select using (auth.role() = 'authenticated');
create policy col_read on colleges     for select using (auth.role() = 'authenticated');

-- =============================================================================
-- Trigger: create profile + student rows on signup
-- =============================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, role, full_name, email)
  values (new.id,
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
          coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(new.email,''));
  -- only seed a students row for student accounts
  if coalesce((new.raw_user_meta_data->>'role'),'student') = 'student' then
    insert into students (id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
