create table public.ipma_notices (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 1 and 200),
 body text not null check (char_length(btrim(body)) > 0),
 is_important boolean not null default false,
 is_published boolean not null default false,
 created_at timestamptz not null default now()
);
create index ipma_notices_published_order on public.ipma_notices
 (is_important desc, created_at desc, id desc) where is_published;
alter table public.ipma_notices enable row level security;
revoke all on public.ipma_notices from public, anon, authenticated;
grant select, insert, update, delete on public.ipma_notices to service_role;

-- All notice reads require an existing ACTIVE, personal-PIN lounge session.
create function public.ipma_read_notices(p_token text, p_id uuid default null, p_limit integer default 20, p_offset integer default 0)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 v_session jsonb;
 v_items jsonb;
 v_total bigint;
begin
 v_session:=public.ipma_validate_executive_session(p_token);
 if coalesce(v_session->>'scope','')<>'lounge'
 or coalesce(v_session->>'status','')<>'ACTIVE'
 or coalesce((v_session->>'must_change_pin')::boolean,true) then
 return jsonb_build_object('ok',false,'error','INVALID_SESSION');
 end if;
 if p_id is not null then
 select jsonb_build_object('id',id,'title',title,'body',body,'is_important',is_important,'created_at',created_at)
 into v_items from public.ipma_notices where id=p_id and is_published;
 if not found then return jsonb_build_object('ok',false,'error','NOT_FOUND');end if;
 return jsonb_build_object('ok',true,'notice',v_items);
 end if;
 select count(*) into v_total from public.ipma_notices where is_published;
 select coalesce(jsonb_agg(to_jsonb(n) order by n.is_important desc,n.created_at desc,n.id desc),'[]'::jsonb)
 into v_items from (
 select id,title,is_important,created_at from public.ipma_notices where is_published
 order by is_important desc,created_at desc,id desc
 limit least(greatest(coalesce(p_limit,20),1),20) offset greatest(coalesce(p_offset,0),0)
 ) n;
 return jsonb_build_object('ok',true,'notices',v_items,'total',v_total);
end;
$$;
revoke all on function public.ipma_read_notices(text,uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.ipma_read_notices(text,uuid,integer,integer) to service_role;
