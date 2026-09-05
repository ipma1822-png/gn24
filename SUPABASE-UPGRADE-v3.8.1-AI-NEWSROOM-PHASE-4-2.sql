-- GLOBAL NEWS24 AI NEWSROOM — PHASE 4-2 / v3.8.1
alter table public.gn24_reporter_submissions
  add column if not exists ai_title_candidates text[] not null default '{}',
  add column if not exists ai_draft_version text,
  add column if not exists ai_drafted_at timestamptz;

-- Draft generation is performed only by the authenticated Supabase Edge Function.
-- No public publication permission is added by this migration.