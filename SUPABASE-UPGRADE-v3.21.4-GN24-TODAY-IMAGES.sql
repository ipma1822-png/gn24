-- GN24 TODAY IMAGE STORAGE
-- Dedicated public delivery bucket; upload/delete restricted to authenticated owner's UID folder.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('today-images','today-images',true,2097152,array['image/webp'])
on conflict(id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/webp'];

drop policy if exists "today users upload own images" on storage.objects;
create policy "today users upload own images" on storage.objects for insert to authenticated
with check (bucket_id='today-images' and (storage.foldername(name))[1]=(select auth.uid())::text and lower(storage.extension(name))='webp');

drop policy if exists "today users delete own images" on storage.objects;
create policy "today users delete own images" on storage.objects for delete to authenticated
using (bucket_id='today-images' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "today hq manage images" on storage.objects;
create policy "today hq manage images" on storage.objects for all to authenticated
using (bucket_id='today-images' and public.is_gn24_admin())
with check (bucket_id='today-images' and public.is_gn24_admin());
