# GLOBAL NEWS24 AI NEWSROOM — PHASE 6-1
Version: v3.10.0

## Reporter network operations dashboard
Created `/pages/admin-reporter-network/` for headquarters administrators and editors.

The dashboard reads the existing `gn24_reporters`, `gn24_reporter_submissions`, and `gn24_articles` data without changing or duplicating reporter records.

It shows:
- total reporters and active reporters
- number of active regions
- total reporter submissions
- published article count
- per-reporter reporter number, role, access level, region, specialties, login linkage, registration date
- per-reporter submission count, published article count, and latest activity time
- status, region and keyword filtering

## Security
The page uses the existing editorial session and requires either `is_gn24_admin()` or `gn24_my_access_level() = 'editor'`. Database RLS remains the enforcement layer. This phase is read-only and adds no appointment, suspension, reactivation or permission mutation controls.

## Compatibility
No production schema change was needed. Existing reporter management, public reporter directory, article CMS and AI editorial desk are unchanged.

## Next
PHASE 6-2 — reporter activity/profile management details and operational history.