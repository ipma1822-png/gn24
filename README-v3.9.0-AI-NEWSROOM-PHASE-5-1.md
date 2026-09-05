# GLOBAL NEWS24 AI NEWSROOM — PHASE 5-1
Version: v3.9.0

## Completed
- Added `/pages/admin-editorial/` as the headquarters AI editorial desk dashboard.
- Added `assets/js/editorial-desk.js`.
- Access is limited to authenticated GN24 administrators or reporters whose `access_level` is `editor`.
- Dashboard shows counts for: 신규 접수, AI 초안, 추가 확인, 편집 검토, 승인, 발행 완료.
- Added status filter, keyword search, reporter/region display, AI title/category summary, missing-fact indicators, linked-article information, and immutable-original capture status.
- Existing article CMS remains unchanged and is linked from the new editorial desk.
- No publication action was added in PHASE 5-1.

## Security
The dashboard reads `gn24_reporter_submissions` through the existing RLS policies. Editors have read-all access; administrators have full access. A signed-in user without administrator/editor mapping is denied even if Supabase Auth created a session.

## Production data note
At implementation time `gn24_reporter_submissions` contained 0 production rows, so no test/fake newsroom submissions were inserted. The dashboard therefore correctly renders an empty queue until real reporter submissions arrive.

## No database migration
PHASE 5-1 required no schema changes. Existing PHASE 1–4 workflow/status fields already support the dashboard.

## Next
PHASE 5-2 — side-by-side original reporter submission ↔ AI draft comparison and review screen.