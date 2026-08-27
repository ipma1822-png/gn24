-- Global News24 v3.5.0
-- 기사별 추가 사진 갤러리(최대 10장)
-- Supabase SQL Editor에서 한 번만 실행하세요.

alter table public.gn24_articles
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

alter table public.gn24_articles
  drop constraint if exists gn24_articles_gallery_images_limit;

alter table public.gn24_articles
  add constraint gn24_articles_gallery_images_limit
  check (
    jsonb_typeof(gallery_images) = 'array'
    and jsonb_array_length(gallery_images) <= 10
  );

comment on column public.gn24_articles.gallery_images is
  '기사 추가 사진 갤러리: [{"url":"...","caption":"..."}], 최대 10장';
