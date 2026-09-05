// GLOBAL NEWS24 AI NEWSROOM PHASE 4-2 v3.8.1
// Production source is deployed as Supabase Edge Function `gn24-draft-article`.
// OPENAI_API_KEY must exist only as a Supabase Edge Function secret; never commit it here.
//
// Security/editorial contract:
// - JWT required.
// - Caller must be a GN24 reporter, editor, or administrator.
// - Submission is read through caller RLS.
// - Draft uses only supplied facts and explicitly returns missing facts.
// - Result is stored in ai_* fields with status=ai_draft.
// - This function never sets gn24_articles.is_published and never publishes an article.
//
// Deployed implementation uses Supabase service credentials supplied by the Edge runtime
// only after caller/RLS verification, and OpenAI Responses API structured JSON output.