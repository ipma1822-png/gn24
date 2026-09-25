-- GLOBAL NEWS24 — GN24 TODAY HQ-ONLY LAUNCH MODE
-- Temporary launch policy for 2026 Chuseok period.
-- Regional moderation foundation remains reserved but is not active.

drop policy if exists "today regional update" on public.gn24_today_posts;
drop policy if exists "today audit regional read" on public.gn24_today_audit;

create or replace function public.gn24_today_before_update()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
declare
  v_is_hq boolean := public.is_gn24_admin();
  v_is_owner boolean := old.author_user_id = auth.uid();
begin
  if not v_is_hq and not v_is_owner then raise exception 'HQ_APPROVAL_ONLY'; end if;

  if v_is_owner and not v_is_hq then
    if old.status not in ('draft','pending','rejected')
       or new.status not in ('draft','pending')
       or new.hq_hidden is distinct from old.hq_hidden
       or new.featured is distinct from old.featured
       or new.news_candidate is distinct from old.news_candidate
       or new.commercial_flag is distinct from old.commercial_flag
       or new.approved_by is distinct from old.approved_by
       or new.approved_at is distinct from old.approved_at
       or new.published_at is distinct from old.published_at
       or new.hidden_at is distinct from old.hidden_at then
      raise exception 'MEMBER_EDIT_ONLY';
    end if;
  end if;

  new.updated_at := now();
  if new.status='published' and old.status is distinct from 'published' then
    if not v_is_hq then raise exception 'HQ_ONLY_PUBLISH'; end if;
    new.approved_by:=auth.uid();
    new.approved_at:=coalesce(new.approved_at,now());
    new.published_at:=coalesce(new.published_at,now());
  end if;
  if new.status='hidden' then
    if not v_is_hq then raise exception 'HQ_ONLY_HIDDEN'; end if;
    new.hq_hidden:=true;
    new.hidden_at:=coalesce(new.hidden_at,now());
  elsif old.status='hidden' and new.status<>'hidden' then
    if not v_is_hq then raise exception 'HQ_ONLY_RESTORE'; end if;
    new.hq_hidden:=false;
    new.hidden_at:=null;
  end if;
  return new;
end;
$$;
revoke all on function public.gn24_today_before_update() from public;

comment on function public.gn24_is_regional_today_admin(text) is
'Reserved for future regional TODAY delegation. Regional moderation policies are disabled during HQ-only launch mode.';
