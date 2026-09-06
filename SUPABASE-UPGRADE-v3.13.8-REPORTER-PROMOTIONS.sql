-- GLOBAL NEWS24 v3.13.8
-- PHASE 7-9: reporter promotion metrics + HQ promotion approval

create or replace function public.gn24_admin_promotion_metrics()
returns table(
  reporter_id text,
  name text,
  reporter_number text,
  reporter_rank text,
  reporter_type text,
  organization_position text,
  regional_hq_code text,
  appointed_at timestamptz,
  active_days integer,
  published_articles bigint,
  submitted_reports bigint,
  avg_edit_score numeric,
  adverse_records bigint,
  candidate_status text,
  target_rank text
)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not (public.is_gn24_admin() or public.gn24_my_access_level() = 'editor') then
    raise exception 'GN24 HQ access required';
  end if;
  return query
  with article_counts as (
    select a.reporter_id,count(*)::bigint cnt from public.gn24_articles a
    where a.reporter_id is not null and a.is_published=true group by a.reporter_id
  ), submission_counts as (
    select s.reporter_id,
      count(*) filter(where s.submitted_at is not null or s.status<>'draft')::bigint cnt,
      round(avg(s.ai_edit_score)::numeric,1) avg_score
    from public.gn24_reporter_submissions s group by s.reporter_id
  ), adverse as (
    select pa.reporter_id,
      count(*) filter(where pa.to_status in ('suspended','terminated') or pa.action in ('suspend','terminate','discipline','warning'))::bigint cnt
    from public.gn24_reporter_personnel_audit pa group by pa.reporter_id
  )
  select r.id,r.name,r.reporter_number,r.reporter_rank,r.reporter_type,r.organization_position,r.regional_hq_code,
    coalesce(r.appointed_at,r.created_at),greatest(0,current_date-coalesce(r.appointed_at,r.created_at)::date)::integer,
    coalesce(ac.cnt,0),coalesce(sc.cnt,0),sc.avg_score,coalesce(ad.cnt,0),
    case
      when r.status<>'active' then '활동상태 확인'
      when r.reporter_rank='기자' and current_date-coalesce(r.appointed_at,r.created_at)::date>=365 and coalesce(ac.cnt,0)>=50 and coalesce(sc.cnt,0)>=20 and coalesce(ad.cnt,0)=0 then '선임기자 심사후보'
      when r.reporter_rank='선임기자' and current_date-coalesce(r.appointed_at,r.created_at)::date>=1095 and coalesce(ac.cnt,0)>=200 and coalesce(sc.cnt,0)>=80 and coalesce(ad.cnt,0)=0 then '수석기자 심사후보'
      when r.reporter_rank='수석기자' then '최고 직급'
      else '기준 미충족' end,
    case when r.reporter_rank='기자' then '선임기자' when r.reporter_rank='선임기자' then '수석기자' else '' end
  from public.gn24_reporters r
  left join article_counts ac on ac.reporter_id=r.id
  left join submission_counts sc on sc.reporter_id=r.id
  left join adverse ad on ad.reporter_id=r.id
  where r.reporter_type not in ('시민기자','청소년기자','어린이기자')
  order by case r.reporter_rank when '수석기자' then 1 when '선임기자' then 2 else 3 end,published_articles desc,r.name asc;
end;
$$;
revoke all on function public.gn24_admin_promotion_metrics() from public,anon;
grant execute on function public.gn24_admin_promotion_metrics() to authenticated;

create or replace function public.gn24_admin_apply_promotion(p_reporter_id text,p_new_rank text,p_reason text default '')
returns public.gn24_reporters
language plpgsql
security invoker
set search_path=public
as $$
declare v_before public.gn24_reporters; v_after public.gn24_reporters; v_allowed boolean:=false;
begin
  if not public.is_gn24_admin() then raise exception 'GN24 HQ admin access required'; end if;
  if p_new_rank not in ('기자','선임기자','수석기자') then raise exception 'Invalid reporter rank'; end if;
  select * into v_before from public.gn24_reporters where id=p_reporter_id for update;
  if not found then raise exception 'Reporter not found'; end if;
  v_allowed := (v_before.reporter_rank='기자' and p_new_rank='선임기자') or (v_before.reporter_rank='선임기자' and p_new_rank='수석기자') or (v_before.reporter_rank=p_new_rank);
  if not v_allowed then raise exception 'Only one-step promotion is allowed'; end if;
  update public.gn24_reporters set reporter_rank=p_new_rank,rank_changed_at=case when reporter_rank is distinct from p_new_rank then now() else rank_changed_at end,updated_at=now() where id=p_reporter_id returning * into v_after;
  if v_before.reporter_rank is distinct from p_new_rank then
    insert into public.gn24_reporter_personnel_audit(reporter_id,action,from_status,to_status,reason)
    values(p_reporter_id,'promotion',v_before.reporter_rank,p_new_rank,coalesce(p_reason,''));
  end if;
  return v_after;
end;
$$;
revoke all on function public.gn24_admin_apply_promotion(text,text,text) from public,anon;
grant execute on function public.gn24_admin_apply_promotion(text,text,text) to authenticated;
