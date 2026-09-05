-- GLOBAL NEWS24 AI NEWSROOM — PHASE 4-3 / v3.8.2
alter table public.gn24_reporter_submissions
  add column if not exists clarification_questions text[] not null default '{}',
  add column if not exists clarification_response text not null default '',
  add column if not exists clarification_requested_at timestamptz,
  add column if not exists clarification_responded_at timestamptz;

-- Existing reporter RLS intentionally remains unchanged:
-- a reporter may update their own row only while current status is draft or revision_requested,
-- and may transition only to draft/submitted. This lets a reporter answer a clarification
-- request without gaining access to AI/editor/approval/publication states.