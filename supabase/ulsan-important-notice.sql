create table public.gn24_regional_notice_receipts (
 notice_code text not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 first_shown_at timestamptz not null default now(),
 read_at timestamptz not null default now(),
 confirmed_at timestamptz,
 primary key (notice_code,user_id),
 constraint gn24_regional_notice_code check (notice_code='ulsan-ghrawi-20261006')
);
alter table public.gn24_regional_notice_receipts enable row level security;
grant select on public.gn24_regional_notice_receipts to authenticated;
create policy gn24_notice_receipt_read on public.gn24_regional_notice_receipts for select to authenticated using (
 public.is_gn24_admin() or (user_id=(select auth.uid()) and exists(select 1 from public.gn24_my_regional_scope() s where s.scope_type='regional_hq' and s.regional_hq_code='ULSAN'))
);
create function public.gn24_regional_notice_record(p_confirm boolean default false)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); confirmed timestamptz;
begin
 if uid is null or public.is_gn24_admin() or not exists(select 1 from public.gn24_my_regional_scope() s where s.scope_type='regional_hq' and s.regional_hq_code='ULSAN') then raise exception 'REGIONAL_HQ_REQUIRED' using errcode='42501'; end if;
 insert into public.gn24_regional_notice_receipts(notice_code,user_id,confirmed_at)
 values('ulsan-ghrawi-20261006',uid,case when p_confirm then now() else null end)
 on conflict(notice_code,user_id) do update set confirmed_at=case when p_confirm then coalesce(gn24_regional_notice_receipts.confirmed_at,now()) else gn24_regional_notice_receipts.confirmed_at end
 returning confirmed_at into confirmed;
 return confirmed is not null;
end $$;
revoke all on function public.gn24_regional_notice_record(boolean) from public,anon;
grant execute on function public.gn24_regional_notice_record(boolean) to authenticated;