# GLOBAL NEWS24 AI NEWSROOM — PHASE 3-3
Version: v3.7.2

## Completed
- Added `/pages/reporter-submit/` mobile quick-reporting page.
- Reporter authentication is required and verified through `gn24_my_reporter_id()`.
- Captures occurred time, location, people/organizations, core facts, reporter notes, source notes, verification contact, and media URLs.
- Supports `draft` and `submitted` creation in `gn24_reporter_submissions`.
- Uses existing reporter-owned RLS; reporter_id is derived from the authenticated reporter session rather than user input.
- Submitted reports receive `submitted_at`; no AI generation or publication occurs at this phase.
- Activated Quick Report entry in Reporter Center.

## Safety / editorial rule
- Reporter sends facts; no automatic publication.
- AI drafting remains PHASE 4 and final publication remains administrator approval only.
- Verification contact is stored for newsroom verification and is not automatically published.
- Direct binary photo upload is intentionally not added in this phase; media URLs are accepted while storage policy/upload flow is handled separately.

## Next
PHASE 3-4: voice reporting.