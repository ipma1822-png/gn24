# GLOBAL NEWS24 AI NEWSROOM — PHASE 4-2
Version: v3.8.1

## Completed
- Added AI draft metadata to `gn24_reporter_submissions`: `ai_title_candidates`, `ai_draft_version`, `ai_drafted_at`.
- Deployed authenticated Edge Function `gn24-draft-article` (JWT verification ON).
- The function reads only submissions accessible to the signed-in GN24 reporter/editor/admin.
- It prepares an internal Korean news draft with 3 title candidates, subtitle, lead, body, image caption, keywords, category, and explicit missing facts.
- Output is saved only into the submission's `ai_*` fields and changes submission workflow to `ai_draft`.
- No article is published and `gn24_articles.is_published` is never changed by this function.

## AI provider secret
The production function expects `OPENAI_API_KEY` as a Supabase Edge Function secret. The current connector can deploy functions but cannot read/create project secrets. Therefore the function is safely deployed but will return `AI_PROVIDER_NOT_CONFIGURED` until that server-side secret exists. No API secret was placed in browser code or GitHub.

## Security review
Supabase security advisor was run after the schema change. No new PHASE 4-2 table/RLS warning appeared. Existing legacy advisories remain for `gn24_admins`, SECURITY DEFINER helper functions, article view increment, and leaked-password protection; these are tracked for PHASE 8 hardening rather than being blindly changed because current RLS/CMS depends on some helpers.

## Next
PHASE 4-3 — missing-fact detection and reporter clarification workflow.