# GLOBAL NEWS24 AI NEWSROOM — PHASE 2-4
Version: v3.6.3

## Completed
- Added `reporter_number` and `source_application_id` to `gn24_reporters`.
- Added unique indexes to prevent duplicate reporter-number issuance and duplicate conversion of one application.
- Added `gn24_reporter_number_seq` for concurrency-safe sequential numbering.
- Added admin-only atomic RPC `gn24_approve_reporter_application(uuid)`.
- Approval now creates an active reporter profile and issues a number such as `GN24-2026-0001`.
- Application type maps to public reporter role: 지역기자 / 전문기자 / 객원기자 / 해외통신원.
- Contributor applications receive `contributor` access; other approved applicants receive `reporter` access.
- Approved applicant email is stored as `login_email` for future reporter-center authentication, but is not exposed as `public_email` automatically.
- Application introduction is not copied to public bio automatically to avoid unintentionally publishing review-only personal text.
- Re-approving the same application returns/links the existing reporter instead of creating a duplicate.
- Admin reporter-application screen now uses the atomic approval RPC and shows issued reporter information.

## Safety
- Only authenticated GN24 admins can execute the conversion RPC.
- Public/anon execution is revoked.
- Existing reporters and articles are preserved.

## Next
PHASE 2-5: automatic reporter-directory integration and display of reporter number/profile metadata.