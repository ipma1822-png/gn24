-- LOCAL TIP MEDIA V2: Storage only; existing application tables/policies unchanged.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('local-tip-media','local-tip-media',false,2097152,array['image/webp']);
create policy local_tip_media_insert on storage.objects
for insert to anon,authenticated
with check (
 bucket_id='local-tip-media'
 and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(0[1-9]|10)\.webp$'
);
create policy local_tip_media_admin_read on storage.objects
for select to authenticated
using (bucket_id='local-tip-media' and (select public.is_gn24_admin()));
