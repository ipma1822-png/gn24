# GLOBAL NEWS24 AI NEWSROOM — PHASE 3-1
Version: v3.7.0

## Completed
- Added `/pages/reporter-center/` mobile reporter center.
- Added email magic-link login for reporters.
- First login may create a Supabase Auth user, but access to the reporter center is granted only when the signed-in email matches an active `gn24_reporters.login_email`.
- Access is verified through `gn24_my_reporter_id()` and `gn24_my_access_level()`.
- Reporter center loads only the authenticated reporter's profile summary and public reporter profile link.
- Added reporter center link to the public reporter directory navigation/footer.
- Prepared disabled placeholders for PHASE 3-2 reporter ID card, PHASE 3-3 quick reporting, PHASE 3-4 voice reporting, and PHASE 3-5 submission/article status.

## Security
- No service-role/secret key is exposed in browser code.
- An unapproved email may obtain a Supabase Auth session but cannot enter the reporter center because the reporter identity RPC returns no active reporter id.
- Suspended/non-active reporters are blocked because the identity helper functions only return active reporters.

## Current data note
- Existing legacy reporters currently have no `login_email`; newly approved reporters from PHASE 2-4 receive login_email from their application automatically.
- Existing reporters can be given a login email later through authorized reporter management without changing their public email.

## Next
PHASE 3-2: mobile reporter ID card.