-- GLOBAL NEWS24 AI NEWSROOM — PHASE 5-4 / v3.9.3
alter table public.gn24_reporter_submissions
  add column if not exists editor_title text not null default '',
  add column if not exists editor_subtitle text not null default '',
  add column if not exists editor_summary text not null default '',
  add column if not exists editor_body text not null default '',
  add column if not exists editor_image_caption text not null default '',
  add column if not exists editor_category text not null default '',
  add column if not exists editor_keywords text[] not null default '{}',
  add column if not exists editor_draft_version text not null default '',
  add column if not exists editor_edited_at timestamptz;

-- Existing RLS remains authoritative. Editors may update reviewable submissions only;
-- this migration does not add approval or publication permission.