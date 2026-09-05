# GLOBAL NEWS24 AI NEWSROOM — PHASE 5-5
Version: v3.9.4

## Final approval flow
Only a verified GN24 administrator can execute the final publish action. Editors can review and save `editor_*` fields but do not receive the publish button.

`gn24_publish_submission(uuid)` is a `SECURITY INVOKER` RPC. It also explicitly checks `is_gn24_admin()`, so the caller must satisfy the existing administrator RLS path. Anonymous execution is revoked.

On final approval the transaction:
1. Locks the reporter submission.
2. Prefers the headquarters `editor_*` draft, falling back to the AI draft only where no edited value exists.
3. Requires a non-empty title and body.
4. Creates one public `gn24_articles` row with `is_published=true` and `workflow_status='published'`.
5. Preserves the reporter link, uses the first submitted media URL as the lead image when available, and carries edited/AI keywords.
6. Updates the submission to `published`, stores `linked_article_id`, `approved_at`, and `published_at`.
7. If the same already-published submission is called again, it returns the existing linked article instead of creating a duplicate.

The browser UI requires an explicit confirmation before invoking the RPC and then opens the published article. This phase does not alter the reporter original snapshot or AI draft.

## GitHub UI
`pages/admin-editorial-compare/` now runs `editorial-compare.js?v=3.9.4`. The final approval button is inserted only for administrators; editors never see it.

## Next
PHASE 6 — reporter management and network operations.