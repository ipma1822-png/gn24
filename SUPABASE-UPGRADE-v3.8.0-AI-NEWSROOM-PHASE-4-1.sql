-- GLOBAL NEWS24 AI NEWSROOM
-- PHASE 4-1 · v3.8.0
-- Structured 5W1H server-side fact analysis foundation

alter table public.gn24_reporter_submissions
  add column if not exists ai_fact_analysis jsonb not null default '{}'::jsonb,
  add column if not exists ai_analysis_version text not null default '',
  add column if not exists ai_analyzed_at timestamptz;

comment on column public.gn24_reporter_submissions.ai_fact_analysis is
  'Structured 5W1H fact analysis generated server-side. Missing facts must remain explicit and must not be invented.';
comment on column public.gn24_reporter_submissions.ai_analysis_version is
  'Version identifier for the analysis logic/model used.';
comment on column public.gn24_reporter_submissions.ai_analyzed_at is
  'Timestamp when server-side fact analysis last completed.';
