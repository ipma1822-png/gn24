-- GLOBAL NEWS24 AI NEWSROOM
-- PHASE 3-5 / v3.7.4
-- Allow an authenticated active reporter to read their own articles,
-- including unpublished workflow states, so the mobile reporter center
-- can show the linked article status without exposing other reporters' drafts.

drop policy if exists "gn24 reporters read own" on public.gn24_articles;

create policy "gn24 reporters read own"
on public.gn24_articles
for select
to authenticated
using (
  reporter_id = public.gn24_my_reporter_id()
);
