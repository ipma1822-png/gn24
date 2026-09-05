# GLOBAL NEWS24 AI NEWSROOM — PHASE 4-4
Version: v3.8.3

## Completed
The production `gn24-draft-article` Edge Function was upgraded from version 1 to version 2 with JWT verification preserved.

Supported story types:
- `general` — 일반 스트레이트 뉴스
- `incident` — 사건·사고
- `martial_sports` — 무도·스포츠
- `safety_drone` — 안전·드론
- `public_interest` — 공익
- `interview` — 인터뷰
- `event` — 행사
- `press_release` — 보도자료 재작성

Each type has a dedicated newsroom style guide. The same anti-hallucination rule remains mandatory: use only supplied facts, never invent quotations/numbers/causes/places/outcomes, and return missing information as `missing_facts`.

Additional safeguards:
- Interview drafts may quote only statements actually supplied by the reporter/source.
- Press-release drafts distinguish institutional claims from independently established facts.
- Incident drafts do not infer cause or responsibility when unconfirmed.
- Safety/drone drafts use only supplied technical performance figures.
- The selected type is recorded in `ai_draft_version` as `4.4-openai-{story_type}`.
- Draft generation never publishes an article. Final administrator approval remains required.

## Production
Supabase project: GLOBAL-NEWS24 (`plqqowwdbgixtczzyanr`)
Edge Function: `gn24-draft-article`
Deployed function version: 2
JWT verification: enabled

## Current limitation
Actual OpenAI generation still requires `OPENAI_API_KEY` to exist as a Supabase Edge Function secret. No secret is stored in GitHub or browser code.

## Next
PHASE 4-5 — preserve and expose the original reporter submission separately from every AI-generated article draft.