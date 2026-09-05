# GLOBAL NEWS24 AI NEWSROOM — PHASE 3-5
Version: v3.7.4

## Completed
- Added `/pages/reporter-status/` for each authenticated reporter's own reporting/article workflow status.
- Status filters: draft, submitted, ai_draft, editor_review, revision_requested, approved, published, rejected.
- Shows reporting time/location, core facts, editorial notes, workflow timeline, and linked article information.
- Published linked articles open the public article page.
- Added `gn24 reporters read own` SELECT RLS policy on `gn24_articles` so active reporters can read their own unpublished linked article metadata without exposing other reporters' drafts.
- Activated `내 취재·기사` in Reporter Center.

## Security / editorial rules
- Reporter identity is derived from `gn24_my_reporter_id()`.
- A reporter can only read their own submissions under existing RLS.
- The added article SELECT policy is limited to rows where `reporter_id = gn24_my_reporter_id()`.
- No publish permission was added. Final publication remains administrator-controlled.

## PHASE 3 result
Reporter login → mobile reporter ID → quick report → voice report → own workflow/status tracking is now connected.

## Next
PHASE 4-1: AI article-writing engine foundation. AI generation must run server-side and must not expose API secrets in browser code.