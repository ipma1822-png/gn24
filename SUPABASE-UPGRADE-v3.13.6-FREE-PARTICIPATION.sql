-- GLOBAL NEWS24 v3.13.6 — FREE PARTICIPATION SYSTEM
-- Applied to production project GLOBAL-NEWS24 (plqqowwdbgixtczzyanr)

alter table public.gn24_participation_applications
  add column if not exists activity_number text unique,
  add column if not exists approved_at timestamptz,
  add column if not exists reviewed_by uuid;

create sequence if not exists public.gn24_participant_activity_seq start 1;

create or replace function public.gn24_assign_participant_activity_number()
returns trigger language plpgsql security invoker set search_path=public as $$
declare prefix text; n bigint;
begin
  if new.status='approved' and (old.status is distinct from 'approved' or new.activity_number is null or btrim(new.activity_number)='') then
    prefix := case new.participant_type when 'citizen' then 'CIT' when 'youth' then 'YTH' when 'junior' then 'JNR' else 'PTC' end;
    n := nextval('public.gn24_participant_activity_seq');
    new.activity_number := 'GN24-'||prefix||'-'||extract(year from current_date)::int||'-'||lpad(n::text,5,'0');
    new.approved_at := coalesce(new.approved_at,now());
    new.reviewed_at := coalesce(new.reviewed_at,now());
    new.reviewed_by := coalesce(new.reviewed_by,auth.uid());
  end if;
  new.updated_at := now(); return new;
end;$$;

create table if not exists public.gn24_participant_submissions (
  id uuid primary key default gen_random_uuid(), participant_type text not null check (participant_type in ('citizen','youth','junior')),
  activity_number text not null default '', name text not null, phone text not null default '', region text not null default '',
  title text not null default '', facts text not null, source_notes text not null default '', media_urls text[] not null default '{}'::text[],
  consent_original_work boolean not null default false, consent_publication_review boolean not null default false,
  status text not null default 'submitted' check (status in ('submitted','reviewing','clarification_requested','accepted','published','rejected')),
  reviewer_notes text not null default '', linked_article_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Production migration also enables RLS, public INSERT only for valid submissions,
-- HQ admin/editor read and HQ admin update policies, explicit Data API grants and indexes.
-- Activity number is an identifier, never an authentication credential.
