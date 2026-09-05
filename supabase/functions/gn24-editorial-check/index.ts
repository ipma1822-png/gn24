// GLOBAL NEWS24 AI NEWSROOM — PHASE 5-3 / v3.9.2
// Production function: gn24-editorial-check (JWT verification required)
//
// Checks: missing title/body/source, known missing facts, unsupported numbers/dates,
// quotation risk, caption-without-media, strong assertions, plus optional semantic
// AI review when OPENAI_API_KEY exists in Supabase Edge Function secrets.
//
// Editorial contract:
// - editor/admin only
// - reads the submission through caller RLS
// - stores results in ai_edit_check / ai_edit_score / ai_edit_check_version / ai_edit_checked_at
// - never changes approval/publication state
// - never publishes gn24_articles
// - OPENAI_API_KEY is never stored in browser code or GitHub
//
// The full production source is deployed in Supabase as function `gn24-editorial-check`.
