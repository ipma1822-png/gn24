-- GLOBAL NEWS24 v3.12.26
-- PRIVATE REPORTER MEDIA
-- Applied to production 2026-09-06.

update storage.buckets
set public = false
where id = 'reporter-media';

-- gn24_publish_submission was also replaced in production so raw reporter-media
-- URLs are no longer copied into public gn24_articles.image.
-- Published article image is intentionally blank until a separate approved
-- public-image copy/promotion flow is added.
-- news-images remains the public publication-media bucket.
