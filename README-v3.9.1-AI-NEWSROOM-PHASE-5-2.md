# GLOBAL NEWS24 AI NEWSROOM — PHASE 5-2
Version: v3.9.1

## Completed
- Added `/pages/admin-editorial-compare/` for side-by-side comparison of the reporter's original submission and the AI draft.
- Comparison view is restricted to authenticated GN24 administrators and editors through the existing identity helpers and RLS.
- Left pane shows the immutable `original_submission` snapshot when available. For older records created before PHASE 4-5, the current source fields are used as a clearly identified fallback.
- Right pane shows AI title candidates, subtitle, lead, article body, image caption, category, keywords, missing facts, AI draft version/time, and reporter clarification response.
- AI editorial dashboard now has an active `원본·AI 비교` link for each submission.
- Existing article CMS and publication permissions were not changed.

## Editorial purpose
The desk can now verify exactly what the reporter originally supplied against what AI produced before any editorial approval or publication decision.

## Security and privacy
The comparison page does not expose source data publicly and is `noindex`. Verification contact information can be seen only by authorized editorial users because the record is read through existing submission RLS. The original snapshot remains read-only in this view.

## Database
No schema migration was required in PHASE 5-2. It uses the immutable source fields added in PHASE 4-5 and the existing AI draft fields.

## Next
PHASE 5-3 — AI editing checks for factual gaps, risky claims, attribution, quotations, dates/numbers, captions, and publication readiness.