# GLOBAL NEWS24 AI NEWSROOM — PHASE 5-4
Version: v3.9.3

## Completed
- Added separate headquarters manual-edit fields to `gn24_reporter_submissions`.
- The original reporter snapshot and AI-generated draft remain untouched.
- The comparison page now includes an editable headquarters draft form for title, subtitle, lead, body, image caption, category, and keywords.
- If no manual draft exists, the form is prefilled from the AI draft to reduce editing work.
- Saving writes only to `editor_*` fields, records `editor_draft_version=5.4-manual-1` and `editor_edited_at`, and moves the submission to `editor_review`.
- Saving does not publish an article and does not grant editors final publication authority.

## Data separation
1. Reporter first submission: `original_submission`
2. AI article draft: `ai_*`
3. Headquarters manual edit: `editor_*`

This separation preserves an auditable chain showing what the reporter sent, what AI generated, and what headquarters changed.

## Security
The existing RLS remains authoritative. Editors can update only submissions in reviewable workflow states and cannot move them directly to public publication. Administrators retain their existing broader permissions. No RLS relaxation was added in PHASE 5-4.

A Supabase security advisor scan after the migration showed no new PHASE 5-4 warning. Existing legacy advisories remain tracked for PHASE 8.

## Next
PHASE 5-5 — final administrator approval and controlled publication to Global News24.