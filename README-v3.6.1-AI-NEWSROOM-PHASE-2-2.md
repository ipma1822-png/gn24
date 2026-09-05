# GLOBAL NEWS24 AI NEWSROOM · PHASE 2-2

Version: **v3.6.1**

## Completed
- Added `gn24_reporter_applications` in Supabase.
- Public/anonymous users can submit a reporter application, but cannot read submitted applications.
- Editors/admins can read applications; only admins can update/delete decisions.
- Added mobile-first `/pages/reporter-apply/` application form.
- Added client-side receipt reference and privacy-consent requirement.
- Connected `/pages/reporter-recruit/` directly to the application form.
- Added a honeypot field to reduce simple bot submissions.

## Fields
Name, phone, email, country, activity region, application type, specialties, experience, introduction, portfolio URL and privacy consent.

## Workflow
`pending -> reviewing -> approved / rejected / withdrawn`

The approval UI and automatic reporter-profile creation are handled in later PHASE 2 steps.
