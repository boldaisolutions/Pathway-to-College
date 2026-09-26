create table if not exists aid_awards (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references students(id) on delete cascade,
  college_name       text not null,
  cost_of_attendance numeric not null default 0,
  grants             numeric not null default 0,
  scholarships       numeric not null default 0,
  loans              numeric not null default 0,
  work_study         numeric not null default 0,
  notes              text default '',
  created_at         timestamptz not null default now()
);
create index if not exists aid_awards_student_idx on aid_awards (student_id);

create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  name        text not null,
  category    text not null default 'Other',
  url         text default '',
  notes       text default '',
  created_at  timestamptz not null default now()
);
create index if not exists documents_student_idx on documents (student_id);

create table if not exists college_fit (
  student_id    uuid primary key references students(id) on delete cascade,
  size          text default '',
  setting       text default '',
  regions       text[] not null default '{}',
  max_distance  text default '',
  cost_priority text default '',
  selectivity   text default '',
  major_focus   text default '',
  campus_life   text default '',
  must_haves    text default '',
  deal_breakers text default '',
  updated_at    timestamptz not null default now()
);

grant select, insert, update, delete on aid_awards, documents, college_fit to anon, authenticated;

alter table aid_awards  enable row level security;
alter table documents   enable row level security;
alter table college_fit enable row level security;

drop policy if exists aid_select on aid_awards;
drop policy if exists aid_write  on aid_awards;
create policy aid_select on aid_awards  for select using (can_view_student(student_id));
create policy aid_write  on aid_awards  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists doc_select on documents;
drop policy if exists doc_write  on documents;
create policy doc_select on documents   for select using (can_view_student(student_id));
create policy doc_write  on documents   for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists fit_select on college_fit;
drop policy if exists fit_write  on college_fit;
create policy fit_select on college_fit for select using (can_view_student(student_id));
create policy fit_write  on college_fit for all using (student_id = auth.uid()) with check (student_id = auth.uid());
