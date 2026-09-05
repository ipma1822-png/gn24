-- GLOBAL NEWS24 AI NEWSROOM — PHASE 5-5 / v3.9.4
create or replace function public.gn24_publish_submission(p_submission_id uuid)
returns table(article_id text, published_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  s public.gn24_reporter_submissions%rowtype;
  r public.gn24_reporters%rowtype;
  v_id text;
  v_now timestamptz := now();
  v_title text; v_subtitle text; v_summary text; v_body text;
  v_caption text; v_category text; v_tags text[]; v_image text;
begin
  if not public.is_gn24_admin() then raise exception 'GN24_ADMIN_REQUIRED'; end if;
  select * into s from public.gn24_reporter_submissions where id=p_submission_id for update;
  if not found then raise exception 'SUBMISSION_NOT_FOUND'; end if;
  if s.status='published' and s.linked_article_id is not null then
    return query select s.linked_article_id,s.published_at; return;
  end if;
  if s.status not in ('editor_review','approved','ai_draft') then raise exception 'SUBMISSION_NOT_READY_FOR_PUBLICATION'; end if;
  v_title:=coalesce(nullif(s.editor_title,''),nullif(s.ai_title,''));
  v_subtitle:=coalesce(nullif(s.editor_subtitle,''),s.ai_subtitle,'');
  v_summary:=coalesce(nullif(s.editor_summary,''),s.ai_summary,'');
  v_body:=coalesce(nullif(s.editor_body,''),nullif(s.ai_body,''));
  v_caption:=coalesce(nullif(s.editor_image_caption,''),s.ai_image_caption,'');
  v_category:=coalesce(nullif(s.editor_category,''),nullif(s.ai_category,''),'국내소식');
  v_tags:=case when coalesce(array_length(s.editor_keywords,1),0)>0 then s.editor_keywords else s.ai_keywords end;
  v_image:=case when coalesce(array_length(s.media_urls,1),0)>0 then s.media_urls[1] else '' end;
  if coalesce(v_title,'')='' then raise exception 'TITLE_REQUIRED'; end if;
  if coalesce(v_body,'')='' then raise exception 'BODY_REQUIRED'; end if;
  select * into r from public.gn24_reporters where id=s.reporter_id;
  loop
    v_id:='gn24-'||to_char(current_date,'YYYYMMDD')||'-'||lpad((floor(random()*1000000))::int::text,6,'0');
    exit when not exists(select 1 from public.gn24_articles where id=v_id);
  end loop;
  insert into public.gn24_articles(id,date,title,subtitle,category,author,summary,image,image_caption,content,source_name,source_url,tags,featured,pinned,visual_style,is_published,reporter_id,workflow_status,created_at,updated_at)
  values(v_id,current_date,v_title,v_subtitle,v_category,coalesce(nullif(r.name,''),'Global News24 편집부'),v_summary,v_image,v_caption,v_body,'Global News24','',coalesce(v_tags,'{}'::text[]),false,false,'normal',true,s.reporter_id,'published',v_now,v_now);
  update public.gn24_reporter_submissions set status='published',linked_article_id=v_id,approved_at=coalesce(approved_at,v_now),published_at=v_now,reviewed_at=coalesce(reviewed_at,v_now),updated_at=v_now where id=p_submission_id;
  return query select v_id,v_now;
end;$$;
revoke execute on function public.gn24_publish_submission(uuid) from public;
revoke execute on function public.gn24_publish_submission(uuid) from anon;
grant execute on function public.gn24_publish_submission(uuid) to authenticated;