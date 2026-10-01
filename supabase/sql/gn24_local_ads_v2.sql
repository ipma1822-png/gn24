CREATE TABLE public.gn24_local_ads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 region_code text NOT NULL CHECK(region_code IN ('seoul','busan','daegu','incheon','gwangju','daejeon','ulsan','sejong','gyeonggi','gangwon','chungbuk','chungnam','jeonbuk','jeonnam','gyeongbuk','gyeongnam','jeju')),
 business_name text NOT NULL CHECK(length(btrim(business_name)) BETWEEN 1 AND 120),
 mode text NOT NULL DEFAULT 'POPUP' CHECK(mode IN ('LINK','POPUP')),
 image_url text NOT NULL CHECK(image_url ~ '^https://'),
 gallery_urls text[] NOT NULL DEFAULT '{}' CHECK(cardinality(gallery_urls)<=12),
 introduction text NOT NULL DEFAULT '' CHECK(length(introduction)<=10000),
 phone text NOT NULL DEFAULT '' CHECK(length(phone)<=100),
 address text NOT NULL DEFAULT '' CHECK(length(address)<=500),
 target_url text NOT NULL DEFAULT '' CHECK(target_url='' OR target_url ~ '^https?://'),
 starts_at timestamptz NOT NULL DEFAULT now(),
 ends_at timestamptz,
 is_published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(ends_at IS NULL OR ends_at>starts_at),
 CHECK(mode<>'LINK' OR target_url<>'')
);
CREATE INDEX gn24_local_ads_region_date ON public.gn24_local_ads(region_code,created_at);
ALTER TABLE public.gn24_local_ads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gn24_local_ads FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.gn24_local_ads TO anon;
GRANT SELECT,INSERT,UPDATE ON public.gn24_local_ads TO authenticated;
GRANT ALL ON public.gn24_local_ads TO service_role;
CREATE POLICY local_ads_public ON public.gn24_local_ads FOR SELECT TO anon,authenticated USING(is_published AND starts_at<=now() AND (ends_at IS NULL OR ends_at>now()));
CREATE POLICY local_ads_admin_read ON public.gn24_local_ads FOR SELECT TO authenticated USING((SELECT public.is_gn24_admin()));
CREATE POLICY local_ads_admin_insert ON public.gn24_local_ads FOR INSERT TO authenticated WITH CHECK((SELECT public.is_gn24_admin()));
CREATE POLICY local_ads_admin_update ON public.gn24_local_ads FOR UPDATE TO authenticated USING((SELECT public.is_gn24_admin())) WITH CHECK((SELECT public.is_gn24_admin()));
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('gn24-local-ads','gn24-local-ads',true,10485760,ARRAY['image/jpeg','image/png','image/webp','image/gif']);
CREATE POLICY local_ads_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='gn24-local-ads' AND (SELECT public.is_gn24_admin()));
CREATE POLICY local_ads_storage_admin_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='gn24-local-ads' AND (SELECT public.is_gn24_admin()));
CREATE POLICY local_ads_storage_cleanup ON storage.objects FOR DELETE TO authenticated USING(bucket_id='gn24-local-ads' AND (SELECT public.is_gn24_admin()));
