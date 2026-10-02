-- Existing HQ rights preserved; branch and other non-HQ users cannot read/update.
-- Reuse existing scope and headquarters mapping. No new table, function or account.
alter policy "gn24 participant submissions admin read"
on public.gn24_participant_submissions to authenticated
using (public.is_gn24_admin() or exists (
 select 1 from public.gn24_my_regional_scope() s
 join public.gn24_regional_headquarters h on h.code=s.regional_hq_code
 where s.scope_type='regional_hq' and h.region_name=gn24_participant_submissions.region
));
alter policy "gn24 participant submissions admin update"
on public.gn24_participant_submissions to authenticated
using (public.is_gn24_admin() or exists (
 select 1 from public.gn24_my_regional_scope() s
 join public.gn24_regional_headquarters h on h.code=s.regional_hq_code
 where s.scope_type='regional_hq' and h.region_name=gn24_participant_submissions.region
))
with check (public.is_gn24_admin() or exists (
 select 1 from public.gn24_my_regional_scope() s
 join public.gn24_regional_headquarters h on h.code=s.regional_hq_code
 where s.scope_type='regional_hq' and h.region_name=gn24_participant_submissions.region
));
