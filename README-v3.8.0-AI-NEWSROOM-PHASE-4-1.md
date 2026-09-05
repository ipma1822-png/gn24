# GLOBAL NEWS24 AI NEWSROOM — PHASE 4-1
Version: v3.8.0

## Completed
- Added structured server-side fact analysis fields to `gn24_reporter_submissions`:
  - `ai_fact_analysis jsonb`
  - `ai_analysis_version text`
  - `ai_analyzed_at timestamptz`
- Deployed Supabase Edge Function `gn24-analyze-submission` with JWT verification enabled.
- The function verifies GN24 reporter/editor/admin identity through existing RPC helpers.
- It reads only submissions the authenticated user may access under existing RLS.
- Server-side privileged write is used only after authorization, so submitted reports can receive analysis without reopening reporter UPDATE permissions.
- Produces a normalized 5W1H envelope: who, when, where, what, why, how, evidence, reporter context, media count.
- Missing facts are written to the existing `ai_missing_facts` array rather than invented.

## Editorial safety rule
PHASE 4-1 is a fact-analysis foundation, not article generation. `why` and `how` remain blank unless explicitly supported by supplied material. No public article is created and no publication status is changed.

## Security
- Edge Function requires a valid Supabase JWT.
- Service-role credentials remain only in the Supabase Edge runtime and are not stored in browser code or GitHub.
- Existing article publication permissions are unchanged.

## Next
PHASE 4-2: model-based title, subtitle, lead, body, caption, keywords and category draft generation from the verified fact envelope.