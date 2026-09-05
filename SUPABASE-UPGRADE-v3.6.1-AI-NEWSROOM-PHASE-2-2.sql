-- GLOBAL NEWS24 AI NEWSROOM
-- PHASE 2-2 · Mobile reporter application
-- Version: v3.6.1

create table if not exists public.gn24_reporter_applications (
  id uuid primary key default gen_random_uuid(),
  client_ref text not null unique,
  name text not null,
  phone text not null,
  email text not null,
  region text not null default '',
  country text not null default '대한민국',
  application_type text not null check (application_type in ('local','specialist','contributor','global')),
  specialties text[] not null default '{}',
  experience text not null default '',
  introduction text not null default '',
  portfolio_url text not null default '',
  photo_url text not null default '',
  consent_privacy boolean not null default false,
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected','withdrawn')),
  reviewer_notes text not null default '',
  reviewed_at timestamptz,
  approved_reporter_id text references public.gn24_reporters(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gn24_reporter_applications_status_idx on public.gn24_reporter_applications(status, created_at desc);
create index if not exists gn24_reporter_applications_email_idx on public.gn24_reporter_applications(lower(email));
create index if not exists gn24_reporter_applications_phone_idx on public.gn24_reporter_applications(phone);

alter table public.gn24_reporter_applications enable row level security;

grant insert on table public.gn24_reporter_applications to anon, authenticated;
grant select on table public.gn24_reporter_applications to authenticated;
grant update, delete on table public.gn24_reporter_applications to authenticated;

drop policy if exists "gn24 applications public insert" on public.gn24_reporter_applications;
create policy "gn24 applications public insert" on public.gn24_reporter_applications
for insert to anon, authenticated
with check (
  status='pending'
  and consent_privacy=true
  and length(trim(name)) between 2 and 80
  and length(trim(phone)) between 8 and 30
  and position('@' in email) > 1
  and application_type in ('local','specialist','contributor','global')
);

drop policy if exists "gn24 applications admin read" on public.gn24_reporter_applications;
create policy "gn24 applications admin read" on public.gn24_reporter_applications
for select to authenticated
using (public.is_gn24_admin() or public.gn24_my_access_level()='editor');

drop policy if exists "gn24 applications admin update" on public.gn24_reporter_applications;
create policy "gn24 applications admin update" on public.gn24_reporter_applications
for update to authenticated
using (public.is_gn24_admin())
with check (public.is_gn24_admin());

drop policy if exists "gn24 applications admin delete" on public.gn24_reporter_applications;
create policy "gn24 applications admin delete" on public.gn24_reporter_applications
for delete to authenticated
using (public.is_gn24_admin());
