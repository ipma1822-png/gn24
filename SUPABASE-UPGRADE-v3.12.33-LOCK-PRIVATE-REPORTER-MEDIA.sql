-- GLOBAL NEWS24 AI NEWSROOM v3.12.33
-- LOCK PRIVATE REPORTER MEDIA
-- Production applied: 2026-09-06

-- reporter-media is a PRIVATE bucket.
-- Remove the obsolete legacy policy that allowed unrestricted SELECT on
-- storage.objects for this bucket. Authorized access remains through the
-- existing admin/editor/reporter-owner policies and signed URLs.

drop policy if exists "gn24 public read reporter media" on storage.objects;

-- Expected final model:
-- reporter-media : private source/evidence media
--   READ  : admin, editor, owning reporter only
--   INSERT: admin, editor, owning reporter according to existing policies
-- news-images    : public publication media only
