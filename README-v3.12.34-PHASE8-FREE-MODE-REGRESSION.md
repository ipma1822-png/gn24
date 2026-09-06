# GLOBAL NEWS24 AI NEWSROOM v3.12.34

## PHASE 8 FREE MODE REGRESSION / LAUNCH READINESS

Date: 2026-09-06
Mode: FREE MODE only. No paid AI dependency is required for the production editorial flow.

### Production checks completed

- Reporter submissions table is intact.
- Two real reporter submissions remain preserved and unpublished.
- Both current real submissions are in `editor_review`.
- Test submission `d989712d-d5f1-4c37-92f1-57c3e5f1fda9` has two private media items and no public representative image selected yet.
- No reporter submission has been silently published during development.
- `gn24_articles` currently contains 58 articles; 56 are public/published and 2 are non-public.
- Existing reporter attribution remains present on 2 articles.
- `reporter-media` is PRIVATE with 10 MB object limit.
- `news-images` remains PUBLIC for publication assets.
- Obsolete unrestricted `gn24 public read reporter media` storage policy has been removed.
- Reporter private media access remains limited through the existing admin/editor/reporter-owner policies.
- `gn24_publish_submission` remains SECURITY INVOKER and requires the existing admin check inside the function.
- `gn24-promote-public-photo` Edge Function is ACTIVE and requires JWT verification.
- Other newsroom Edge Functions are ACTIVE and also require JWT verification.

### End-to-end production path now implemented

Reporter recruitment → application → approval → reporter authentication → mobile reporter center → text/voice/photo submission → HQ editorial review → manual FREE MODE edit → private source-photo review → one-tap approved public-photo promotion → final admin review → explicit public publish → reporter profile/public article integration.

### Final launch gate still intentionally open

PHASE 8 is not marked fully launched until one genuine reporter submission is explicitly published by the final administrator from the production final-publish screen and the resulting public article, representative image, linked submission, and reporter profile reflection are verified afterward.

Development automation must never perform that public publish action silently.

### Current release

`v3.12.34 · PHASE 8 FREE MODE REGRESSION READY`
