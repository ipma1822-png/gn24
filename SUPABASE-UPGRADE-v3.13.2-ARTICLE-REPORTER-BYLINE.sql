-- GLOBAL NEWS24 PHASE 7-3
-- Version: v3.13.2
-- Purpose: expose approved public reporter organization fields for automatic article bylines.

drop function if exists public.gn24_public_reporters();

create function public.gn24_public_reporters()
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
  display_order integer,
  reporter_rank text,
  reporter_type text,
  organization_position text,
  regional_hq_code text,
  special_designations text[]
)
language sql
stable
security invoker
set search_path = public
as $$
  select r.id, r.reporter_number, r.name, r.role, r.affiliation, r.photo_url, r.bio,
         r.specialties, r.region, r.public_email, r.display_order,
         r.reporter_rank, r.reporter_type, r.organization_position, r.regional_hq_code,
         r.special_designations
  from public.gn24_reporters r
  where r.status = 'active'
  order by r.display_order asc, r.name asc;
$$;

revoke all on function public.gn24_public_reporters() from public;
grant execute on function public.gn24_public_reporters() to anon, authenticated;

grant select (reporter_rank, reporter_type, organization_position, regional_hq_code, special_designations)
  on public.gn24_reporters to anon;
