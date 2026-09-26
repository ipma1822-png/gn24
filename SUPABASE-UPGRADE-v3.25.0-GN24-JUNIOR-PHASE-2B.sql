-- GN24 JUNIOR PRESS V1 — PHASE 2B
-- DB + RLS security foundation. Creates JUNIOR-only objects.

create sequence public.gn24_junior_reporter_number_seq as bigint start with 1 increment by 1 minvalue 1 maxvalue 9999 no cycle cache 1;

create table public.gn24_junior_reporters (
  internal_id bigint generated always as identity primary key,
  real_name text not null,
  nickname text not null,
  reporter_id text,
  pin_hash text,
  status text not null default 'PENDING',
  guardian_consent_status text not null default 'PENDING',
  guardian_consent_verified_at timestamptz,
  guardian_consent_verified_by uuid,
  consent_version text not null default 'v1',
  identifiable_photo_consent boolean not null default false,
  applied_at timestamptz not null default now(), approved_at timestamptz, joined_at timestamptz, paused_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint gn24_junior_reporters_real_name_valid check (real_name = btrim(real_name) and real_name <> ''),
  constraint gn24_junior_reporters_nickname_valid check (nickname <> '' and nickname = regexp_replace(btrim(nickname), '\s+', ' ', 'g')),
  constraint gn24_junior_reporters_reporter_id_format check (reporter_id is null or reporter_id ~ '^GN24-JR-[0-9]{4}$'),
  constraint gn24_junior_reporters_status_valid check (status in ('PENDING','ACTIVE','PAUSED','GRADUATED')),
  constraint gn24_junior_reporters_consent_status_valid check (guardian_consent_status in ('PENDING','VERIFIED')),
  constraint gn24_junior_reporters_consent_version_valid check (consent_version = btrim(consent_version) and consent_version <> ''),
  constraint gn24_junior_reporters_consent_verification_complete check (guardian_consent_status <> 'VERIFIED' or (guardian_consent_verified_at is not null and guardian_consent_verified_by is not null)),
  constraint gn24_junior_reporters_active_consent_gate check (status <> 'ACTIVE' or guardian_consent_status = 'VERIFIED'),
  constraint gn24_junior_reporters_reporter_id_lifecycle check ((status='PENDING' and reporter_id is null) or (status in ('ACTIVE','PAUSED','GRADUATED') and reporter_id is not null)),
  constraint gn24_junior_reporters_reporter_id_unique unique (reporter_id)
);
create unique index gn24_junior_reporters_nickname_normalized_uidx on public.gn24_junior_reporters (lower(nickname));

create table public.gn24_junior_audit (
  id bigint generated always as identity primary key,
  junior_reporter_internal_id bigint not null references public.gn24_junior_reporters(internal_id) on delete restrict,
  action text not null,
  actor uuid,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint gn24_junior_audit_action_valid check (action in ('APPROVE','PAUSE','RESUME','GRADUATE','NICKNAME_CHANGE','PIN_RESET','CONSENT_VERIFY')),
  constraint gn24_junior_audit_metadata_object check (jsonb_typeof(metadata)='object')
);
create index gn24_junior_audit_reporter_created_idx on public.gn24_junior_audit(junior_reporter_internal_id, created_at desc);

create table public.gn24_junior_badges (
  id bigint generated always as identity primary key,
  junior_reporter_internal_id bigint not null references public.gn24_junior_reporters(internal_id) on delete restrict,
  badge_code text not null,
  earned_at timestamptz not null default now(),
  related_article_id text,
  granted_by uuid,
  constraint gn24_junior_badges_code_valid check (badge_code in ('FIRST_ARTICLE','FIRST_INTERVIEW','GOOD_FRIEND','COMMUNITY_REPORTER','MY_DREAM','CHALLENGER','5_ARTICLES','10_ARTICLES')),
  constraint gn24_junior_badges_reporter_code_unique unique (junior_reporter_internal_id,badge_code)
);
create index gn24_junior_badges_reporter_earned_idx on public.gn24_junior_badges(junior_reporter_internal_id, earned_at desc);

alter table public.gn24_junior_reporters enable row level security;
alter table public.gn24_junior_audit enable row level security;
alter table public.gn24_junior_badges enable row level security;
create policy gn24_junior_reporters_admin_select on public.gn24_junior_reporters for select to authenticated using (public.is_gn24_admin());
create policy gn24_junior_audit_admin_select on public.gn24_junior_audit for select to authenticated using (public.is_gn24_admin());
create policy gn24_junior_badges_admin_select on public.gn24_junior_badges for select to authenticated using (public.is_gn24_admin());

create or replace function public.gn24_admin_verify_junior_consent(p_internal_id bigint,p_consent_version text,p_identifiable_photo_consent boolean default false)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_gn24_admin() then raise exception 'GN24 admin authorization required' using errcode='42501'; end if;
  if p_consent_version is null or btrim(p_consent_version)='' or p_consent_version<>btrim(p_consent_version) then raise exception 'Valid consent version required' using errcode='22023'; end if;
  update public.gn24_junior_reporters set guardian_consent_status='VERIFIED', guardian_consent_verified_at=now(), guardian_consent_verified_by=auth.uid(), consent_version=p_consent_version, identifiable_photo_consent=coalesce(p_identifiable_photo_consent,false), updated_at=now() where internal_id=p_internal_id and status='PENDING';
  if not found then raise exception 'Pending junior reporter not found' using errcode='P0002'; end if;
  insert into public.gn24_junior_audit(junior_reporter_internal_id,action,actor,metadata) values (p_internal_id,'CONSENT_VERIFY',auth.uid(),jsonb_build_object('consent_version',p_consent_version,'identifiable_photo_consent',coalesce(p_identifiable_photo_consent,false)));
end; $$;

create or replace function public.gn24_admin_approve_junior_reporter(p_internal_id bigint)
returns text language plpgsql security definer set search_path='' as $$
declare v_reporter public.gn24_junior_reporters%rowtype; v_number bigint; v_reporter_id text;
begin
  if not public.is_gn24_admin() then raise exception 'GN24 admin authorization required' using errcode='42501'; end if;
  select * into v_reporter from public.gn24_junior_reporters where internal_id=p_internal_id for update;
  if not found then raise exception 'Junior reporter not found' using errcode='P0002'; end if;
  if v_reporter.status<>'PENDING' then raise exception 'Junior reporter is not pending' using errcode='P0001'; end if;
  if v_reporter.guardian_consent_status<>'VERIFIED' then raise exception 'Verified guardian consent required' using errcode='23514'; end if;
  if v_reporter.reporter_id is not null then raise exception 'Reporter ID already assigned' using errcode='23505'; end if;
  v_number:=nextval('public.gn24_junior_reporter_number_seq'::regclass);
  v_reporter_id:='GN24-JR-'||lpad(v_number::text,4,'0');
  update public.gn24_junior_reporters set reporter_id=v_reporter_id,status='ACTIVE',approved_at=now(),joined_at=now(),paused_at=null,updated_at=now() where internal_id=p_internal_id;
  insert into public.gn24_junior_audit(junior_reporter_internal_id,action,actor,metadata) values (p_internal_id,'APPROVE',auth.uid(),jsonb_build_object('reporter_id',v_reporter_id));
  return v_reporter_id;
end; $$;

revoke all on table public.gn24_junior_reporters from public,anon,authenticated;
revoke all on table public.gn24_junior_audit from public,anon,authenticated;
revoke all on table public.gn24_junior_badges from public,anon,authenticated;
revoke all on sequence public.gn24_junior_reporter_number_seq from public,anon,authenticated;
revoke all on function public.gn24_admin_verify_junior_consent(bigint,text,boolean) from public,anon;
revoke all on function public.gn24_admin_approve_junior_reporter(bigint) from public,anon;
grant select on table public.gn24_junior_reporters to authenticated;
grant select on table public.gn24_junior_audit to authenticated;
grant select on table public.gn24_junior_badges to authenticated;
grant execute on function public.gn24_admin_verify_junior_consent(bigint,text,boolean) to authenticated;
grant execute on function public.gn24_admin_approve_junior_reporter(bigint) to authenticated;
grant select,insert,update,delete on table public.gn24_junior_reporters to service_role;
grant select,insert on table public.gn24_junior_audit to service_role;
grant select,insert,update,delete on table public.gn24_junior_badges to service_role;
grant usage,select on sequence public.gn24_junior_reporter_number_seq to service_role;

comment on table public.gn24_junior_reporters is 'PRIVATE GN24 JUNIOR reporter identity and consent data. Never expose directly to anon.';
comment on column public.gn24_junior_reporters.pin_hash is 'Trusted-server generated PIN hash only. Plaintext PIN storage is prohibited.';
comment on table public.gn24_junior_audit is 'Minimal GN24 JUNIOR security audit log. Never store PIN values or duplicate real names in metadata.';
comment on table public.gn24_junior_badges is 'GN24 JUNIOR badge records. No automatic badge granting in Phase 2B.';
