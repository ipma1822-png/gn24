-- GLOBAL NEWS24 AI NEWSROOM PHASE 8-1
-- Version: v3.12.0
-- Purpose: keep public reporter directory working without exposing login_email or internal fields.

create or replace function public.gn24_public_reporters()
returns table (
  id text,
  reporter_number text,
  name text,
  role text,
  affiliation text,
  photo_url text,
  bio text,
  specialties text[],
  region text,
  public_email text,
  display_order integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select r.id, r.reporter_number, r.name, r.role, r.affiliation, r.photo_url, r.bio,
         r.specialties, r.region, r.public_email, r.display_order
  from public.gn24_reporters r
  where r.status = 'active'
  order by r.display_order asc, r.name asc;
$$;

revoke all on table public.gn24_reporters from anon;
grant select (id, reporter_number, name, role, affiliation, photo_url, bio, specialties, region, public_email, display_order, status)
  on public.gn24_reporters to anon;

revoke all on function public.gn24_public_reporters() from public;
grant execute on function public.gn24_public_reporters() to anon, authenticated;

drop policy if exists "public read active reporters" on public.gn24_reporters;
create policy "anon read active reporters"
on public.gn24_reporters for select to anon
using (status = 'active');

create policy "authenticated read allowed reporters"
on public.gn24_reporters for select to authenticated
using (
  status = 'active'
  or is_gn24_admin()
  or lower(login_email) = lower(coalesce(auth.jwt()->>'email',''))
);
