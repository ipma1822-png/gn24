-- GLOBAL NEWS24 AI NEWSROOM
-- PHASE 2-4 · Reporter number + profile registration
-- Version: v3.6.3

alter table public.gn24_reporters
  add column if not exists reporter_number text,
  add column if not exists source_application_id uuid references public.gn24_reporter_applications(id) on update cascade on delete set null;

create unique index if not exists gn24_reporters_reporter_number_uq
  on public.gn24_reporters(reporter_number) where reporter_number is not null;
create unique index if not exists gn24_reporters_source_application_uq
  on public.gn24_reporters(source_application_id) where source_application_id is not null;

create sequence if not exists public.gn24_reporter_number_seq start 1;

create or replace function public.gn24_approve_reporter_application(p_application_id uuid)
returns table(reporter_id text, reporter_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  app public.gn24_reporter_applications%rowtype;
  existing public.gn24_reporters%rowtype;
  seq_no bigint;
  new_number text;
  new_id text;
  new_role text;
  new_access text;
begin
  if not public.is_gn24_admin() then raise exception 'GN24_ADMIN_REQUIRED'; end if;

  select * into app from public.gn24_reporter_applications where id=p_application_id for update;
  if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;

  if app.approved_reporter_id is not null then
    select * into existing from public.gn24_reporters where id=app.approved_reporter_id;
    if found then return query select existing.id, existing.reporter_number; return; end if;
  end if;

  select * into existing from public.gn24_reporters
   where source_application_id=app.id
      or (login_email is not null and lower(login_email)=lower(trim(app.email)))
   limit 1;
  if found then
    update public.gn24_reporter_applications set status='approved',approved_reporter_id=existing.id,reviewed_at=now(),updated_at=now() where id=app.id;
    return query select existing.id, existing.reporter_number; return;
  end if;

  seq_no:=nextval('public.gn24_reporter_number_seq');
  new_number:='GN24-'||to_char(current_date,'YYYY')||'-'||lpad(seq_no::text,4,'0');
  new_id:='gn24-r-'||to_char(current_date,'YYYY')||'-'||lpad(seq_no::text,4,'0');
  new_role:=case app.application_type when 'local' then '지역기자' when 'specialist' then '전문기자' when 'contributor' then '객원기자' when 'global' then '해외통신원' else '기자' end;
  new_access:=case when app.application_type='contributor' then 'contributor' else 'reporter' end;

  insert into public.gn24_reporters(id,name,role,affiliation,photo_url,bio,specialties,region,public_email,status,display_order,access_level,login_email,reporter_number,source_application_id)
  values(new_id,app.name,new_role,'Global News24','','',app.specialties,app.region,'','active',1000+seq_no::int,new_access,lower(trim(app.email)),new_number,app.id);

  update public.gn24_reporter_applications set status='approved',approved_reporter_id=new_id,reviewed_at=now(),updated_at=now() where id=app.id;
  return query select new_id,new_number;
end;
$$;

revoke all on function public.gn24_approve_reporter_application(uuid) from public, anon;
grant execute on function public.gn24_approve_reporter_application(uuid) to authenticated;
