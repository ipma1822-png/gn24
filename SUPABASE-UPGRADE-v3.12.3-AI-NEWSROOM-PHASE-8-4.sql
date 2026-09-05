-- GLOBAL NEWS24 AI NEWSROOM
-- PHASE 8-4 · v3.12.3
-- Safe performance fix identified by Supabase advisor.

create index if not exists gn24_reporter_applications_approved_reporter_idx
  on public.gn24_reporter_applications(approved_reporter_id)
  where approved_reporter_id is not null;

-- No production rows are modified.
-- Existing RLS policies and workflow are preserved.