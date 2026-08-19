-- Global News24 v3.3.2 기자 권한 시스템
-- 기존 v3.3.1 사이트에 1회 실행하세요. 기존 기사/관리자 데이터는 삭제하지 않습니다.

create table if not exists public.gn24_reporters (
  id text primary key, name text not null, role text default '기자', affiliation text default 'Global News24',
  photo_url text default '', bio text default '', specialties text[] default '{}', region text default '',
  public_email text default '', status text default 'active', display_order integer default 100,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

alter table public.gn24_reporters add column if not exists access_level text not null default 'reporter';
alter table public.gn24_reporters add column if not exists login_email text;
create unique index if not exists gn24_reporters_login_email_uq on public.gn24_reporters(lower(login_email)) where login_email is not null;

alter table public.gn24_articles add column if not exists reporter_id text;
alter table public.gn24_articles add column if not exists workflow_status text not null default 'published';

create or replace function public.gn24_my_reporter_id() returns text language sql stable security definer set search_path=public as $$
  select id from public.gn24_reporters where status='active' and lower(login_email)=lower(coalesce(auth.jwt()->>'email','')) limit 1;
$$;
create or replace function public.gn24_my_access_level() returns text language sql stable security definer set search_path=public as $$
  select access_level from public.gn24_reporters where status='active' and lower(login_email)=lower(coalesce(auth.jwt()->>'email','')) limit 1;
$$;
revoke all on function public.gn24_my_reporter_id() from public;
revoke all on function public.gn24_my_access_level() from public;
grant execute on function public.gn24_my_reporter_id() to authenticated;
grant execute on function public.gn24_my_access_level() to authenticated;

alter table public.gn24_reporters enable row level security;
drop policy if exists "public read active reporters" on public.gn24_reporters;
create policy "public read active reporters" on public.gn24_reporters for select using (status='active' or public.is_gn24_admin() or lower(login_email)=lower(coalesce(auth.jwt()->>'email','')));
drop policy if exists "admins manage reporters" on public.gn24_reporters;
create policy "admins manage reporters" on public.gn24_reporters for all to authenticated using (public.is_gn24_admin()) with check (public.is_gn24_admin());

-- 기사 쓰기 권한: 관리자는 전체, 편집국은 전체, 정식/객원 기자는 자기 기사만.
drop policy if exists "gn24 admins manage articles" on public.gn24_articles;
create policy "gn24 admins manage articles" on public.gn24_articles for all to authenticated using (public.is_gn24_admin()) with check (public.is_gn24_admin());
drop policy if exists "gn24 reporters insert own" on public.gn24_articles;
create policy "gn24 reporters insert own" on public.gn24_articles for insert to authenticated with check (
  reporter_id=public.gn24_my_reporter_id() and (is_published=false or public.gn24_my_access_level()='editor')
);
drop policy if exists "gn24 reporters update own" on public.gn24_articles;
create policy "gn24 reporters update own" on public.gn24_articles for update to authenticated using (
  public.gn24_my_access_level()='editor' or reporter_id=public.gn24_my_reporter_id()
) with check (
  public.gn24_my_access_level()='editor' or (reporter_id=public.gn24_my_reporter_id() and is_published=false)
);

-- Storage: 기자도 자기 기사 대표이미지를 올릴 수 있도록 허용(공개 버킷 유지).
drop policy if exists "gn24 reporters upload images" on storage.objects;
create policy "gn24 reporters upload images" on storage.objects for insert to authenticated with check (bucket_id='news-images' and public.gn24_my_reporter_id() is not null);

-- 권한 의미
-- editor      : 편집국 / 전체 기사 관리 및 발행 가능
-- reporter    : 정식기자 / 자기 기사 작성·수정, 발행은 편집국 승인
-- contributor : 객원기자 / 자기 기사 작성 후 승인대기
