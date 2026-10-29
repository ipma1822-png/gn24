-- Daejeon-only community publication boundary. Review before applying to production.
-- Separate public content from private gn24_participant_submissions (name/phone).
create table if not exists public.gn24_daejeon_community_posts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.gn24_participant_submissions(id),
  category text not null check (category in ('경조사','행사 소식','인물 동정','개업·이전','단체 소식','지역 알림')),
  title text not null check (char_length(btrim(title)) between 2 and 160),
  body text not null check (char_length(btrim(body)) between 20 and 5000),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.gn24_daejeon_community_posts enable row level security;
revoke all on public.gn24_daejeon_community_posts from public, anon, authenticated;
grant select on public.gn24_daejeon_community_posts to anon, authenticated;
grant insert, update, delete on public.gn24_daejeon_community_posts to authenticated;
-- Public SELECT exposes ONLY the curated public table, never private submissions.
create policy "daejeon community public read" on public.gn24_daejeon_community_posts
for select to anon, authenticated using (true);
-- Existing HQ admins only. Regional directors have no INSERT/UPDATE/DELETE policy.
create policy "daejeon community HQ publish" on public.gn24_daejeon_community_posts
for insert to authenticated with check (
 (select public.is_gn24_admin())
 and exists (
   select 1 from public.gn24_participant_submissions source
   where source.id = submission_id
     and source.region = '대전'
     and source.status = 'accepted'
     and source.consent_original_work
     and source.consent_publication_review
     and strpos(chr(10) || source.source_notes || chr(10), chr(10) || '유형: ' || category || chr(10)) > 0
 )
);
create policy "daejeon community HQ edit" on public.gn24_daejeon_community_posts
for update to authenticated using ((select public.is_gn24_admin()))
with check ((select public.is_gn24_admin()) and exists (select 1 from public.gn24_participant_submissions source where source.id=submission_id and source.region='대전' and source.status='accepted'));
create policy "daejeon community HQ delete" on public.gn24_daejeon_community_posts
for delete to authenticated using ((select public.is_gn24_admin()));
-- IMPORTANT: HQ publication UI must manually remove personal information before copying
-- any submission facts. Do not copy name, phone, email, or media_urls automatically.
