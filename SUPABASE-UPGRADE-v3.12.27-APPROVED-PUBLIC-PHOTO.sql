-- GLOBAL NEWS24 v3.12.27
-- APPROVED PUBLIC PHOTO FLOW
-- Applied to production 2026-09-06.

alter table public.gn24_reporter_submissions
  add column if not exists approved_public_image text not null default '';
alter table public.gn24_reporter_submissions
  add column if not exists approved_public_image_at timestamptz;

-- Production gn24_publish_submission now publishes ONLY approved_public_image.
-- Raw reporter-media URLs are never copied to gn24_articles.image.
-- reporter-media: private evidence bucket
-- news-images: public publication bucket
