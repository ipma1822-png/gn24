-- Global News24 v3.2.0 CMS setup
create table if not exists public.gn24_articles (
  id text primary key,
  date date not null default current_date,
  title text not null,
  subtitle text default '',
  category text default '국내소식',
  author text default 'Global News24 편집부',
  summary text default '',
  image text default '',
  image_caption text default '',
  content text default '',
  source_name text default '',
  source_url text default '',
  tags text[] default '{}',
  featured boolean default false,
  pinned boolean default false,
  visual_style text default 'normal',
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.gn24_articles enable row level security;
drop policy if exists "public read published gn24" on public.gn24_articles;
create policy "public read published gn24" on public.gn24_articles for select using (is_published = true);
drop policy if exists "authenticated manage gn24" on public.gn24_articles;
create policy "authenticated manage gn24" on public.gn24_articles for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public)
values ('news-images','news-images',true)
on conflict (id) do update set public=true;

drop policy if exists "public read gn24 images" on storage.objects;
create policy "public read gn24 images" on storage.objects for select using (bucket_id='news-images');
drop policy if exists "authenticated manage gn24 images" on storage.objects;
create policy "authenticated manage gn24 images" on storage.objects for all to authenticated using (bucket_id='news-images') with check (bucket_id='news-images');
