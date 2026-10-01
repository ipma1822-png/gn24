create table public.ipma_meetings (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 1 and 200),
 agenda text not null check (char_length(btrim(agenda)) between 1 and 20000),
 status text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
 is_published boolean not null default false,
 scheduled_at timestamptz,
 closed_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.ipma_meeting_opinions (
 id uuid primary key default gen_random_uuid(),
 meeting_id uuid not null references public.ipma_meetings(id),
 executive_id uuid not null references public.ipma_executives(id),
 author_name text not null,
 author_position text not null default '',
 author_organization text not null default '',
 body text not null check (char_length(btrim(body)) between 1 and 3000),
 created_at timestamptz not null default now()
);
create index ipma_meetings_order on public.ipma_meetings(created_at desc,id desc) where is_published;
create index ipma_meeting_opinions_order on public.ipma_meeting_opinions(meeting_id,created_at desc,id desc);
create index ipma_meeting_opinions_rate on public.ipma_meeting_opinions(executive_id,created_at desc);
alter table public.ipma_meetings enable row level security;
alter table public.ipma_meeting_opinions enable row level security;
revoke all on public.ipma_meetings, public.ipma_meeting_opinions from public,anon,authenticated;
grant select,insert,update,delete on public.ipma_meetings,public.ipma_meeting_opinions to service_role;

create function public.ipma_meeting_access(p_token text,p_action text default 'list',p_id uuid default null,p_body text default null,p_offset integer default 0)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 s jsonb; m public.ipma_meetings%rowtype; items jsonb; opinions jsonb; total bigint; opinion_id uuid;
begin
 s:=public.ipma_validate_executive_session(p_token);
 if coalesce(s->>'scope','')<>'lounge' or coalesce(s->>'status','')<>'ACTIVE'
 or coalesce((s->>'must_change_pin')::boolean,true) then
 return jsonb_build_object('ok',false,'error','INVALID_SESSION');end if;
 if p_action='list' then
 select count(*) into total from public.ipma_meetings where is_published;
 select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc,t.id desc),'[]'::jsonb) into items from (
 select id,title,case when status='CLOSED' or closed_at is not null then 'CLOSED' else 'OPEN' end as status,scheduled_at,created_at
 from public.ipma_meetings where is_published order by created_at desc,id desc
 limit 20 offset greatest(coalesce(p_offset,0),0))t;
 return jsonb_build_object('ok',true,'meetings',items,'total',total);
 end if;
 if p_action not in ('detail','opinion') or p_action is null or p_id is null then
 return jsonb_build_object('ok',false,'error','INVALID_REQUEST');end if;
 if p_action='opinion' then
 if p_body is null or char_length(btrim(p_body)) not between 1 and 3000 then
 return jsonb_build_object('ok',false,'error','INVALID_OPINION');end if;
 perform pg_advisory_xact_lock(hashtextextended('ipma-opinion:'||(s->>'executive_id'),0));
 select * into m from public.ipma_meetings where id=p_id and is_published for update;
 else
 select * into m from public.ipma_meetings where id=p_id and is_published;
 end if;
 if not found then return jsonb_build_object('ok',false,'error','NOT_FOUND');end if;
 if p_action='opinion' then
 if m.status='CLOSED' or m.closed_at is not null then
 return jsonb_build_object('ok',false,'error','MEETING_CLOSED');end if;
 select count(*) into total from public.ipma_meeting_opinions
 where executive_id=(s->>'executive_id')::uuid and created_at>clock_timestamp()-interval '15 minutes';
 if total>=5 then return jsonb_build_object('ok',false,'error','RATE_LIMITED');end if;
 insert into public.ipma_meeting_opinions(meeting_id,executive_id,author_name,author_position,author_organization,body)
 values(m.id,(s->>'executive_id')::uuid,s->>'name',coalesce(s->>'position',''),coalesce(s->>'organization',''),btrim(p_body))
 returning id into opinion_id;
 return jsonb_build_object('ok',true,'opinion_id',opinion_id);
 end if;
 select count(*) into total from public.ipma_meeting_opinions where meeting_id=m.id;
 select coalesce(jsonb_agg(to_jsonb(o) order by o.created_at,o.id),'[]'::jsonb) into opinions from (
 select id,author_name,author_position,author_organization,body,created_at
 from public.ipma_meeting_opinions where meeting_id=m.id order by created_at desc,id desc limit 100)o;
 return jsonb_build_object('ok',true,'meeting',jsonb_build_object('id',m.id,'title',m.title,'agenda',m.agenda,
 'status',case when m.status='CLOSED' or m.closed_at is not null then 'CLOSED' else 'OPEN' end,
 'scheduled_at',m.scheduled_at,'closed_at',m.closed_at,'created_at',m.created_at),
 'opinions',opinions,'opinion_total',total);
end;
$$;
revoke all on function public.ipma_meeting_access(text,text,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.ipma_meeting_access(text,text,uuid,text,integer) to service_role;
