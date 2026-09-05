# GLOBAL NEWS24 AI NEWSROOM — PHASE 3-2
Version: v3.7.1

## Completed
- Added authenticated mobile digital reporter ID card at `/pages/reporter-card/`.
- Card displays reporter photo, name, role, reporter number, affiliation, active region, specialties, and active status.
- Access requires the existing reporter session and a successful `gn24_my_reporter_id()` check.
- Reporter data is fetched only for the authenticated active reporter.
- Added public-profile verification link and logout action.
- Enabled the `내 기자증` menu in `/pages/reporter-center/`.

## Safety
- No secret/service-role key is exposed.
- If reporter status is no longer active, the reporter ID RPC no longer resolves and the digital card is not shown.
- No production data or database schema was changed in PHASE 3-2.
- Existing reporters without reporter_number still render safely as `기자번호 미발급`.

## Next
PHASE 3-3: ultra-simple mobile field-report submission using the existing `gn24_reporter_submissions` foundation.