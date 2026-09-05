# GLOBAL NEWS24 AI NEWSROOM — PHASE 8-4
Version: v3.12.3
Date: 2026-09-06

## Scope
Integrated regression/readiness review, safe database performance remediation, backup/recovery operating plan, and production launch checklist.

## Production baseline verified
- gn24_articles: 58
- published articles: 56
- gn24_reporters: 2
- active reporters: 2
- reporter applications: 0
- reporter submissions: 0
- submission audit rows: 0
- RLS enabled on articles, reporters, reporter applications, reporter submissions, and submission audit.
- No fake reporter, submission, article, or audit data created for testing.

## Safe performance remediation applied
Supabase advisor reported an unindexed foreign key on gn24_reporter_applications.approved_reporter_id.
Added a partial covering index without modifying production rows or workflow policies.

## Regression/readiness review
Preserve and verify these production paths:
1. Public news home/article/archive and existing 56 published articles.
2. Reporter recruitment → application → admin approval → reporter profile/number.
3. Reporter Center → Wizard → voice/text/photo submission.
4. Stable draft/client_submission_key duplicate protection.
5. AI draft → reporter confirmation → editor_review.
6. Editorial desk → AI checks → manual edit → final admin publish.
7. Public reporter directory uses safe public RPC and does not expose login_email.
8. Submission audit records state transitions without copying full sensitive field content.
9. Reporter session helper refreshes expiring access tokens and clears invalid sessions.

## Backup and recovery operating plan
Before beta/launch and before any future destructive migration:
- Keep GitHub main as the source snapshot for static app and SQL migration records.
- Verify Supabase project backup/PITR availability in the project dashboard before launch.
- Record current schema migration files in GitHub before every DDL change.
- Do not test destructive recovery against production. Restore drills should use a separate safe environment/branch when available and explicitly approved.
- For incident recovery, freeze writes first, identify the last known good migration/commit, then restore database and app independently as needed.

## Open launch blockers / controlled follow-ups
- OPENAI_API_KEY must exist server-side for live AI draft generation; never place it in browser/GitHub.
- Leaked-password protection remains disabled in Supabase Auth and requires dashboard/configuration action.
- Existing SECURITY DEFINER helper advisories remain. They are tied to current identity/view-count/approval flows and were not blindly revoked.
- reporter-media is public-read for current article/editor compatibility. Raw field-evidence privacy should receive a dedicated storage-policy decision before broad reporter rollout.
- Existing performance advisor warnings about multiple permissive policies/RLS init plan should be optimized only with regression coverage; no risky policy rewrite was made in this phase.
- Real end-to-end reporter submission/publish still requires a genuine reporter test rather than fake production data.

## Launch gate
Code/data structure is ready for controlled beta after the server-side AI secret and storage privacy decision are confirmed. Start with existing approved reporters, run one genuine end-to-end story, verify audit trail and final publishing, then expand recruitment.

## Next
PHASE 8-5 — final production launch gate: close remaining safe blockers where connector access permits, prepare controlled beta checklist/status page, and declare AI NEWSROOM production-ready only after blockers are explicitly classified.