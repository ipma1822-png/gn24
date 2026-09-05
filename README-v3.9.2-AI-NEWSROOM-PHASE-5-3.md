# GLOBAL NEWS24 AI NEWSROOM — PHASE 5-3
Version: v3.9.2

## Completed
- Added internal editorial QA result fields to `gn24_reporter_submissions`.
- Deployed authenticated Edge Function `gn24-editorial-check` with JWT verification enabled.
- Access is limited to GN24 administrators and editors.
- Added an "AI 편집검사 실행" control to the original-vs-AI comparison screen.
- Stored checks are displayed with an internal readiness score and detailed warning list.

## Baseline checks
The server always performs deterministic checks for:
- missing title/body/source facts
- weak source notes
- known missing facts
- numbers appearing in the AI draft but not in the source/clarification material
- date expressions appearing only in the AI draft
- quotation-form risk when the source has no clear quotation
- image caption when no media URL exists
- strong assertion wording that needs editorial verification

## Optional semantic AI review
If `OPENAI_API_KEY` exists in Supabase Edge Function secrets, the same function also asks the server-side model to compare SOURCE vs DRAFT for unsupported claims, source gaps, quotation risks, number/date risks, caption risks, and readiness notes. If the secret is absent or the semantic call fails, the deterministic baseline still runs and is saved.

## Safety/editorial contract
- The check is editorial QA only.
- `ai_edit_score` is a reference score, not a publication decision.
- The function never sets approved/published states and never publishes `gn24_articles`.
- Original reporter source remains separate from AI output.
- No OpenAI secret is stored in browser code or GitHub.

## Production
Supabase project: GLOBAL-NEWS24 (`plqqowwdbgixtczzyanr`)
Edge Function: `gn24-editorial-check`
Function version: 1
JWT verification: enabled

## Security advisor
No new PHASE 5-3 RLS/table warning was introduced. Existing project advisories remain for the legacy `gn24_admins` no-policy configuration, SECURITY DEFINER helper/view-count functions, and leaked-password protection. These remain tracked for PHASE 8 hardening because several helpers are part of current RLS/CMS behavior.

## Next
PHASE 5-4 — administrator/editor manual edit workflow.