-- GLOBAL NEWS24 v3.14.0
-- Reporter probation system v1

alter table public.gn24_reporters
  add column if not exists career_stage text not null default 'official',
  add column if not exists probation_start_at timestamptz,
  add column if not exists probation_due_at timestamptz,
  add column if not exists probation_completed_at timestamptz,
  add column if not exists probation_review_status text not null default 'not_applicable',
  add column if not exists probation_exempt boolean not null default false,
  add column if not exists probation_exempt_reason text not null default '',
  add column if not exists probation_notes text not null default '',
  add column if not exists official_appointed_at timestamptz;

alter table public.gn24_reporters
  drop constraint if exists gn24_reporters_career_stage_check,
  add constraint gn24_reporters_career_stage_check check (career_stage in ('probation','official','probation_ended')),
  drop constraint if exists gn24_reporters_probation_review_status_check,
  add constraint gn24_reporters_probation_review_status_check check (probation_review_status in ('not_applicable','in_progress','extended','approved','ended','exempted'));

update public.gn24_reporters
set official_appointed_at = coalesce(official_appointed_at, appointed_at, created_at)
where career_stage = 'official' and official_appointed_at is null;

create or replace function public.gn24_admin_update_probation(p_reporter_id text,p_action text,p_reason text default '')
returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  r public.gn24_reporters%rowtype;
  old_stage text;
  new_stage text;
  audit_action text;
begin
  if not public.is_gn24_admin() then raise exception 'GN24_ADMIN_REQUIRED'; end if;
  select * into r from public.gn24_reporters where id=p_reporter_id for update;
  if not found then raise exception 'REPORTER_NOT_FOUND'; end if;
  old_stage:=r.career_stage;

  case p_action
    when 'start' then
      update public.gn24_reporters set career_stage='probation',probation_start_at=now(),probation_due_at=now()+interval '3 months',probation_completed_at=null,probation_review_status='in_progress',probation_exempt=false,probation_exempt_reason='',probation_notes=coalesce(p_reason,''),status=case when status='terminated' then 'active' else status end,terminated_at=case when status='terminated' then null else terminated_at end,updated_at=now() where id=p_reporter_id;
      new_stage:='probation'; audit_action:='probation_start';
    when 'approve' then
      update public.gn24_reporters set career_stage='official',probation_completed_at=now(),probation_review_status='approved',probation_notes=case when coalesce(p_reason,'')<>'' then p_reason else probation_notes end,official_appointed_at=coalesce(official_appointed_at,now()),appointed_at=coalesce(appointed_at,now()),updated_at=now() where id=p_reporter_id;
      new_stage:='official'; audit_action:='probation_approve';
    when 'extend' then
      if r.career_stage<>'probation' then raise exception 'PROBATION_REQUIRED'; end if;
      update public.gn24_reporters set probation_due_at=greatest(coalesce(probation_due_at,now()),now())+interval '30 days',probation_review_status='extended',probation_notes=case when coalesce(p_reason,'')<>'' then p_reason else probation_notes end,updated_at=now() where id=p_reporter_id;
      new_stage:='probation'; audit_action:='probation_extend';
    when 'end' then
      if r.career_stage<>'probation' then raise exception 'PROBATION_REQUIRED'; end if;
      update public.gn24_reporters set career_stage='probation_ended',probation_completed_at=now(),probation_review_status='ended',probation_notes=case when coalesce(p_reason,'')<>'' then p_reason else probation_notes end,status='terminated',status_reason=case when coalesce(p_reason,'')<>'' then p_reason else '수습 종료' end,status_changed_at=now(),terminated_at=now(),updated_at=now() where id=p_reporter_id;
      new_stage:='probation_ended'; audit_action:='probation_end';
    when 'exempt' then
      update public.gn24_reporters set career_stage='official',probation_exempt=true,probation_exempt_reason=coalesce(p_reason,''),probation_completed_at=now(),probation_due_at=null,probation_review_status='exempted',official_appointed_at=coalesce(official_appointed_at,now()),appointed_at=coalesce(appointed_at,now()),updated_at=now() where id=p_reporter_id;
      new_stage:='official'; audit_action:='probation_exempt';
    else raise exception 'INVALID_PROBATION_ACTION';
  end case;

  insert into public.gn24_reporter_personnel_audit(reporter_id,application_id,action,from_status,to_status,reason)
  values(p_reporter_id,r.source_application_id,audit_action,old_stage,new_stage,coalesce(p_reason,''));

  return (select jsonb_build_object('reporter_id',id,'career_stage',career_stage,'probation_start_at',probation_start_at,'probation_due_at',probation_due_at,'probation_completed_at',probation_completed_at,'probation_review_status',probation_review_status,'probation_exempt',probation_exempt,'official_appointed_at',official_appointed_at,'status',status) from public.gn24_reporters where id=p_reporter_id);
end;
$$;

revoke all on function public.gn24_admin_update_probation(text,text,text) from public,anon;
grant execute on function public.gn24_admin_update_probation(text,text,text) to authenticated;

-- Existing application approval flow is kept, but new approved applicants now enter probation.
create or replace function public.gn24_approve_reporter_application(p_application_id uuid)
returns table(reporter_id text, reporter_number text)
language plpgsql
security definer
set search_path to 'public'
as $function$
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
    if found then return query select existing.id,existing.reporter_number; return; end if;
  end if;

  select * into existing from public.gn24_reporters where source_application_id=app.id or (login_email is not null and lower(login_email)=lower(trim(app.email))) limit 1;
  if found then
    update public.gn24_reporter_applications set status='approved',approved_reporter_id=existing.id,reviewed_at=now(),updated_at=now() where id=app.id;
    return query select existing.id,existing.reporter_number; return;
  end if;

  seq_no:=nextval('public.gn24_reporter_number_seq');
  new_number:='GN24-'||to_char(current_date,'YYYY')||'-'||lpad(seq_no::text,4,'0');
  new_id:='gn24-r-'||to_char(current_date,'YYYY')||'-'||lpad(seq_no::text,4,'0');
  new_role:=case app.application_type when 'local' then '지역기자' when 'specialist' then '전문기자' when 'contributor' then '객원기자' when 'global' then '해외통신원' else '일반기자' end;
  new_access:=case when app.application_type='contributor' then 'contributor' else 'reporter' end;

  insert into public.gn24_reporters(id,name,role,affiliation,photo_url,bio,specialties,region,public_email,status,display_order,access_level,login_email,reporter_number,source_application_id,reporter_rank,reporter_type,career_stage,probation_start_at,probation_due_at,probation_review_status)
  values(new_id,app.name,case when new_role='일반기자' then '기자' else new_role end,'Global News24','','',app.specialties,app.region,'','active',1000+seq_no::int,new_access,lower(trim(app.email)),new_number,app.id,'기자',new_role,'probation',now(),now()+interval '3 months','in_progress');

  update public.gn24_reporter_applications set status='approved',approved_reporter_id=new_id,reviewed_at=now(),updated_at=now() where id=app.id;
  insert into public.gn24_reporter_personnel_audit(reporter_id,application_id,action,from_status,to_status,reason) values(new_id,app.id,'probation_start',null,'probation','지원 승인 후 3개월 수습 시작');
  return query select new_id,new_number;
end;
$function$;

revoke all on function public.gn24_approve_reporter_application(uuid) from public,anon;
grant execute on function public.gn24_approve_reporter_application(uuid) to authenticated;