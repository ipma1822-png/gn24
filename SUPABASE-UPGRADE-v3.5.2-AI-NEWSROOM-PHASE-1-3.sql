-- GLOBAL NEWS24 AI NEWSROOM PHASE 1-3
-- Permission hardening for admin/editor/reporter/contributor roles.

alter table public.gn24_reporters drop constraint if exists gn24_reporters_access_level_check;
alter table public.gn24_reporters add constraint gn24_reporters_access_level_check
check (access_level in ('editor','reporter','contributor'));

drop policy if exists "gn24 reporters admin delete" on public.gn24_reporters;
drop policy if exists "gn24 reporters admin insert" on public.gn24_reporters;
drop policy if exists "gn24 reporters admin update" on public.gn24_reporters;
drop policy if exists "gn24 reporters authenticated read" on public.gn24_reporters;
drop policy if exists "gn24 reporters public active read" on public.gn24_reporters;

drop policy if exists "public read active reporters" on public.gn24_reporters;
create policy "public read active reporters" on public.gn24_reporters
for select to public
using (
  status='active'
  or public.is_gn24_admin()
  or lower(login_email)=lower(coalesce(auth.jwt()->>'email',''))
);

drop policy if exists "admins manage reporters" on public.gn24_reporters;
create policy "admins manage reporters" on public.gn24_reporters
for all to authenticated
using (public.is_gn24_admin())
with check (public.is_gn24_admin());

drop policy if exists "gn24 reporters insert own" on public.gn24_articles;
create policy "gn24 reporters insert own" on public.gn24_articles
for insert to authenticated
with check (
  reporter_id=public.gn24_my_reporter_id()
  and is_published=false
  and workflow_status in ('draft','editor_review')
);

drop policy if exists "gn24 reporters update own" on public.gn24_articles;
create policy "gn24 reporters update own" on public.gn24_articles
for update to authenticated
using (
  (public.gn24_my_access_level()='editor' and is_published=false)
  or reporter_id=public.gn24_my_reporter_id()
)
with check (
  is_published=false
  and (
    public.gn24_my_access_level()='editor'
    or reporter_id=public.gn24_my_reporter_id()
  )
  and workflow_status in ('draft','editor_review','rejected')
);

drop policy if exists "gn24 submissions admin all" on public.gn24_reporter_submissions;
create policy "gn24 submissions admin all" on public.gn24_reporter_submissions
for all to authenticated
using (public.is_gn24_admin())
with check (public.is_gn24_admin());

create policy "gn24 submissions editor read all" on public.gn24_reporter_submissions
for select to authenticated
using (public.gn24_my_access_level()='editor');

create policy "gn24 submissions editor review update" on public.gn24_reporter_submissions
for update to authenticated
using (
  public.gn24_my_access_level()='editor'
  and status in ('submitted','ai_draft','editor_review','revision_requested')
)
with check (
  public.gn24_my_access_level()='editor'
  and status in ('ai_draft','editor_review','revision_requested')
);

revoke execute on function public.is_gn24_admin() from anon;
revoke execute on function public.gn24_my_reporter_id() from anon;
revoke execute on function public.gn24_my_access_level() from anon;

grant execute on function public.is_gn24_admin() to authenticated;
grant execute on function public.gn24_my_reporter_id() to authenticated;
grant execute on function public.gn24_my_access_level() to authenticated;

comment on table public.gn24_reporters is 'GN24 reporter directory and newsroom role mapping. reporter appointment/status remains admin-only.';
