-- Global News24 v3.5.1 · AI NEWSROOM PHASE 1-2
-- Article workflow consistency migration.
-- Existing article content is preserved. Visibility and workflow state are synchronized.

update public.gn24_articles
set workflow_status = case when is_published then 'published' else 'draft' end
where workflow_status is null
   or workflow_status not in ('draft','editor_review','approved','published','rejected','archived')
   or (is_published = true and workflow_status <> 'published')
   or (is_published = false and workflow_status = 'published');

alter table public.gn24_articles alter column workflow_status set default 'draft';
alter table public.gn24_articles alter column workflow_status set not null;

alter table public.gn24_articles drop constraint if exists gn24_articles_workflow_status_check;
alter table public.gn24_articles add constraint gn24_articles_workflow_status_check
check (workflow_status in ('draft','editor_review','approved','published','rejected','archived'));

create or replace function public.gn24_sync_article_workflow()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if tg_op = 'UPDATE' and new.is_published is distinct from old.is_published then
    if new.is_published then
      new.workflow_status := 'published';
    elsif new.workflow_status = 'published' then
      new.workflow_status := 'draft';
    end if;
  else
    if new.is_published then
      new.workflow_status := 'published';
    elsif new.workflow_status = 'published' then
      new.is_published := true;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists gn24_sync_article_workflow_trg on public.gn24_articles;
create trigger gn24_sync_article_workflow_trg
before insert or update on public.gn24_articles
for each row execute function public.gn24_sync_article_workflow();

comment on column public.gn24_articles.workflow_status is
'Article workflow: draft, editor_review, approved, published, rejected, archived. Public visibility is synchronized with published status.';
