-- GLOBAL NEWS24 AI NEWSROOM — PHASE 5-3 / v3.9.2
alter table public.gn24_reporter_submissions
  add column if not exists ai_edit_check jsonb not null default '{}'::jsonb,
  add column if not exists ai_edit_score integer,
  add column if not exists ai_edit_check_version text,
  add column if not exists ai_edit_checked_at timestamptz;

comment on column public.gn24_reporter_submissions.ai_edit_check is 'Internal editorial QA result. Does not approve or publish an article.';
comment on column public.gn24_reporter_submissions.ai_edit_score is 'Internal readiness score 0-100; never a publication decision.';