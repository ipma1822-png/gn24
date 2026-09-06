-- GLOBAL NEWS24 AI NEWSROOM v3.12.24
-- Reporter media privacy foundation

alter table public.gn24_reporter_submissions
  add column if not exists media_paths text[] not null default '{}'::text[];

update public.gn24_reporter_submissions s
set media_paths = coalesce((
  select array_agg(regexp_replace(u, '^https://[^/]+/storage/v1/object/public/reporter-media/', ''))
  from unnest(coalesce(s.media_urls,'{}'::text[])) u
  where u like '%/storage/v1/object/public/reporter-media/%'
), '{}'::text[])
where cardinality(coalesce(s.media_paths,'{}'::text[])) = 0
  and cardinality(coalesce(s.media_urls,'{}'::text[])) > 0;

create policy "gn24 authenticated read authorized reporter media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reporter-media'
  and (
    public.is_gn24_admin()
    or public.gn24_my_access_level() = 'editor'
    or (storage.foldername(name))[1] = public.gn24_my_reporter_id()
  )
);

create or replace function public.gn24_sync_reporter_media_paths()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.media_paths := coalesce((
    select array_agg(regexp_replace(u, '^https://[^/]+/storage/v1/object/public/reporter-media/', ''))
    from unnest(coalesce(new.media_urls,'{}'::text[])) u
    where u like '%/storage/v1/object/public/reporter-media/%'
  ), '{}'::text[]);
  return new;
end;
$$;

drop trigger if exists gn24_sync_reporter_media_paths_trg on public.gn24_reporter_submissions;
create trigger gn24_sync_reporter_media_paths_trg
before insert or update of media_urls on public.gn24_reporter_submissions
for each row execute function public.gn24_sync_reporter_media_paths();
