import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "AUTH_REQUIRED" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userSb = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const adminSb = createClient(url, service, { auth: { persistSession: false } });

  const body = await req.json().catch(() => ({}));
  const submissionId = clean(body?.submission_id);
  if (!submissionId) return json({ error: "SUBMISSION_ID_REQUIRED" }, 400);

  const { data: reporterId } = await userSb.rpc("gn24_my_reporter_id");
  const { data: accessLevel } = await userSb.rpc("gn24_my_access_level");
  const { data: isAdmin } = await userSb.rpc("is_gn24_admin");
  if (!reporterId && accessLevel !== "editor" && !isAdmin) {
    return json({ error: "GN24_ACCESS_DENIED" }, 403);
  }

  const { data: row, error: readError } = await userSb
    .from("gn24_reporter_submissions")
    .select("id,reporter_id,status,occurred_at,location,people,facts,reporter_notes,source_notes,contact_for_verification,media_urls")
    .eq("id", submissionId)
    .maybeSingle();

  if (readError) return json({ error: "SUBMISSION_READ_FAILED", detail: readError.message }, 400);
  if (!row) return json({ error: "SUBMISSION_NOT_FOUND" }, 404);

  const analysis = {
    who: clean(row.people),
    when: row.occurred_at || "",
    where: clean(row.location),
    what: clean(row.facts),
    why: "",
    how: "",
    evidence: clean(row.source_notes),
    reporter_context: clean(row.reporter_notes),
    media_count: Array.isArray(row.media_urls) ? row.media_urls.length : 0,
  };

  const missing: string[] = [];
  if (!analysis.who) missing.push("누가 관련되어 있는지");
  if (!analysis.when) missing.push("언제 발생했는지");
  if (!analysis.where) missing.push("어디서 발생했는지");
  if (!analysis.what) missing.push("무슨 일이 있었는지");
  if (!analysis.why) missing.push("왜 발생했는지 또는 배경");
  if (!analysis.how) missing.push("어떻게 진행됐는지");

  const { error: updateError } = await adminSb
    .from("gn24_reporter_submissions")
    .update({
      ai_fact_analysis: analysis,
      ai_missing_facts: missing,
      ai_analysis_version: "4.1-baseline-2",
      ai_analyzed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (updateError) return json({ error: "ANALYSIS_SAVE_FAILED", detail: updateError.message }, 400);

  return json({
    ok: true,
    submission_id: submissionId,
    analysis,
    missing_facts: missing,
    mode: "fact-normalization",
    note: "PHASE 4-1 records only supplied facts. Missing facts remain explicit; article generation starts in PHASE 4-2.",
  });
});
