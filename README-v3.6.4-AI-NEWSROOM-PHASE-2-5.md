# GLOBAL NEWS24 AI NEWSROOM — PHASE 2-5
Version: v3.6.4

## Completed
- Public reporter directory now reads `reporter_number` together with the existing reporter profile fields.
- Any approved application converted by PHASE 2-4 into an active `gn24_reporters` row appears automatically in `/pages/reporters/` without manual HTML editing.
- Reporter cards and reporter profile pages display the official reporter number when one exists.
- Reporter profile pages continue to load that reporter's published articles automatically from `gn24_articles` by `reporter_id`.
- Legacy reporter records without a reporter number remain fully compatible and continue to display normally.
- Reporter directory asset cache version advanced to v3.6.4.

## End-to-end PHASE 2 flow
Recruitment page → mobile application → HQ review → admin approval → reporter number/profile creation → public reporter directory + reporter article room.

## Safety
- Only active reporters are publicly listed.
- `login_email` is not selected or exposed by the public directory.
- `public_email` is shown only when explicitly present in the reporter profile.
- No existing reporter or article data was changed.

## Next
PHASE 3-1: reporter login and mobile Reporter Center foundation.