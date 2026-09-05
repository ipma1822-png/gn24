-- GLOBAL NEWS24 AI NEWSROOM
-- PHASE 7-2 · v3.11.1
-- Reporter direct mobile photo upload

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reporter-media',
  'reporter-media',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gn24 public read reporter media" on storage.objects;
create policy "gn24 public read reporter media"
on storage.objects for select
to public
using (bucket_id = 'reporter-media');

drop policy if exists "gn24 reporters upload own media" on storage.objects;
create policy "gn24 reporters upload own media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'reporter-media'
  and gn24_my_reporter_id() is not null
  and (storage.foldername(name))[1] = gn24_my_reporter_id()
);

drop policy if exists "gn24 admins manage reporter media" on storage.objects;
create policy "gn24 admins manage reporter media"
on storage.objects for all
to authenticated
using (bucket_id = 'reporter-media' and is_gn24_admin())
with check (bucket_id = 'reporter-media' and is_gn24_admin());