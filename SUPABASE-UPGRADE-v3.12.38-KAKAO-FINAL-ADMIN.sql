-- GLOBAL NEWS24 AI NEWSROOM v3.12.38
-- KAKAO FINAL ADMIN
-- Production applied: 2026-09-06

alter table public.gn24_admins
  add column if not exists auth_user_id uuid;

-- Bind the existing final-admin record to the already-approved Kakao identity
-- that is attached to reporter profile gn24-jeon.
update public.gn24_admins a
set auth_user_id = r.auth_user_id
from public.gn24_reporters r
where a.active = true
  and lower(a.email) = lower('jeonseongkweon@gmail.com')
  and r.id = 'gn24-jeon'
  and r.auth_user_id is not null;

create or replace function public.is_gn24_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.gn24_admins
    where active = true
      and (
        (auth_user_id is not null and auth_user_id = auth.uid())
        or lower(email) = lower(coalesce(auth.jwt()->>'email',''))
      )
  );
$function$;
