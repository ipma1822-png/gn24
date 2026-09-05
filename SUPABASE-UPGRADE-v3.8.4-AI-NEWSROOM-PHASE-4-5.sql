-- GLOBAL NEWS24 AI NEWSROOM — PHASE 4-5 / v3.8.4
alter table public.gn24_reporter_submissions
  add column if not exists original_submission jsonb,
  add column if not exists original_captured_at timestamptz;

create or replace function public.gn24_capture_original_submission()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.status='submitted' and old.status='draft' and new.original_submission is null then
    new.original_submission:=jsonb_build_object('occurred_at',new.occurred_at,'location',new.location,'people',new.people,'facts',new.facts,'reporter_notes',new.reporter_notes,'source_notes',new.source_notes,'contact_for_verification',new.contact_for_verification,'media_urls',to_jsonb(new.media_urls),'submitted_at',coalesce(new.submitted_at,now()));
    new.original_captured_at:=now();
  end if;
  if old.original_submission is not null then new.original_submission:=old.original_submission; new.original_captured_at:=old.original_captured_at; end if;
  return new;
end;$$;

drop trigger if exists trg_gn24_capture_original_submission on public.gn24_reporter_submissions;
create trigger trg_gn24_capture_original_submission before update on public.gn24_reporter_submissions for each row execute function public.gn24_capture_original_submission();

create or replace function public.gn24_capture_original_submission_insert()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.status='submitted' and new.original_submission is null then
    new.original_submission:=jsonb_build_object('occurred_at',new.occurred_at,'location',new.location,'people',new.people,'facts',new.facts,'reporter_notes',new.reporter_notes,'source_notes',new.source_notes,'contact_for_verification',new.contact_for_verification,'media_urls',to_jsonb(new.media_urls),'submitted_at',coalesce(new.submitted_at,now()));
    new.original_captured_at:=now();
  end if;
  return new;
end;$$;

drop trigger if exists trg_gn24_capture_original_submission_insert on public.gn24_reporter_submissions;
create trigger trg_gn24_capture_original_submission_insert before insert on public.gn24_reporter_submissions for each row execute function public.gn24_capture_original_submission_insert();