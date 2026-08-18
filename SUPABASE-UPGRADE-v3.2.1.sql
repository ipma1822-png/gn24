-- Global News24 v3.2.1 관리자 권한 강화
-- v3.2.0 SQL 실행 후 이 SQL을 한 번 실행하세요.

create table if not exists public.gn24_admins (
  email text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gn24_admins enable row level security;

create or replace function public.is_gn24_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gn24_admins
    where active = true
      and lower(email) = lower(coalesce(auth.jwt()->>'email',''))
  );
$$;

revoke all on function public.is_gn24_admin() from public;
grant execute on function public.is_gn24_admin() to authenticated;

drop policy if exists "authenticated manage gn24" on public.gn24_articles;
drop policy if exists "gn24 admins manage articles" on public.gn24_articles;
create policy "gn24 admins manage articles"
on public.gn24_articles
for all
to authenticated
using (public.is_gn24_admin())
with check (public.is_gn24_admin());

drop policy if exists "authenticated manage gn24 images" on storage.objects;
drop policy if exists "gn24 admins manage images" on storage.objects;
create policy "gn24 admins manage images"
on storage.objects
for all
to authenticated
using (bucket_id='news-images' and public.is_gn24_admin())
with check (bucket_id='news-images' and public.is_gn24_admin());

-- 관리자 계정을 Supabase Authentication > Users에서 먼저 만든 다음,
-- 아래 YOUR_ADMIN_EMAIL을 실제 관리자 이메일로 바꿔 한 번 실행하세요.
-- insert into public.gn24_admins(email, active)
-- values ('YOUR_ADMIN_EMAIL', true)
-- on conflict (email) do update set active = true;
