-- IPMA executive authentication base. No public table access or UI wiring.
create table public.ipma_executives (
 id uuid primary key default gen_random_uuid(),
 name text not null unique check (name = btrim(name) and char_length(name) between 1 and 80),
 pin_hash text not null check (pin_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'),
 status text not null default 'INACTIVE' check (status in ('ACTIVE','INACTIVE')),
 session_hash text,
 session_expires_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.ipma_executive_auth_attempts (
 bucket text primary key,
 started_at timestamptz not null,
 attempts integer not null check (attempts >= 0)
);
alter table public.ipma_executives enable row level security;
alter table public.ipma_executive_auth_attempts enable row level security;
revoke all on public.ipma_executives, public.ipma_executive_auth_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.ipma_executives, public.ipma_executive_auth_attempts to service_role;

-- Trusted provisioning only; raw PIN never persists. PIN changes revoke the session.
create function public.ipma_set_executive_pin(p_name text, p_pin text, p_status text default 'INACTIVE')
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
 if p_name is null or char_length(btrim(p_name)) not between 1 and 80
    or p_pin is null or p_pin !~ '^[0-9]{6}$'
    or p_status is null or p_status not in ('ACTIVE','INACTIVE') then
   raise exception 'Invalid executive credentials';
 end if;
 insert into public.ipma_executives(name, pin_hash, status)
 values (btrim(p_name), extensions.crypt(p_pin, extensions.gen_salt('bf',12)), p_status)
 on conflict (name) do update set pin_hash=excluded.pin_hash, status=excluded.status,
 session_hash=null, session_expires_at=null
 returning id into v_id;
 return v_id;
end;
$$;

-- Service-only RPC called by the Edge Function. Atomic buckets prevent parallel bypass.
create function public.ipma_authenticate_executive(p_name text, p_pin text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 v_now timestamptz := clock_timestamp();
 v_count integer;
 v_bucket text;
 v_exec public.ipma_executives%rowtype;
 v_token text;
begin
 if p_name is null or char_length(btrim(p_name)) not between 1 and 80
    or p_pin is null or p_pin !~ '^[0-9]{6}$' then
   return jsonb_build_object('ok',false,'error','INVALID_CREDENTIALS');
 end if;
 insert into public.ipma_executive_auth_attempts as a(bucket,started_at,attempts)
 values ('global',v_now,1)
 on conflict (bucket) do update set
 attempts=case when a.started_at <= v_now-interval '1 minute' then 1 else a.attempts+1 end,
 started_at=case when a.started_at <= v_now-interval '1 minute' then v_now else a.started_at end
 returning attempts into v_count;
 if v_count > 100 then return jsonb_build_object('ok',false,'error','RATE_LIMITED'); end if;
 v_bucket := 'name:' || encode(extensions.digest(btrim(p_name),'sha256'),'hex');
 insert into public.ipma_executive_auth_attempts as a(bucket,started_at,attempts)
 values (v_bucket,v_now,1)
 on conflict (bucket) do update set
 attempts=case when a.started_at <= v_now-interval '15 minutes' then 1 else a.attempts+1 end,
 started_at=case when a.started_at <= v_now-interval '15 minutes' then v_now else a.started_at end
 returning attempts into v_count;
 if v_count > 5 then return jsonb_build_object('ok',false,'error','RATE_LIMITED'); end if;
 select * into v_exec from public.ipma_executives where name=btrim(p_name) for update;
 if not found then return jsonb_build_object('ok',false,'error','INVALID_CREDENTIALS'); end if;
 if extensions.crypt(p_pin,v_exec.pin_hash) <> v_exec.pin_hash or v_exec.status <> 'ACTIVE' then
   return jsonb_build_object('ok',false,'error','INVALID_CREDENTIALS');
 end if;
 v_token := encode(extensions.gen_random_bytes(32),'hex');
 update public.ipma_executives set session_hash=encode(extensions.digest(v_token,'sha256'),'hex'),
 session_expires_at=v_now+interval '1 hour' where id=v_exec.id;
 return jsonb_build_object('ok',true,'executive_id',v_exec.id,'name',v_exec.name,
 'status','ACTIVE','token',v_token,'expires_at',v_now+interval '1 hour');
end;
$$;

create function public.ipma_validate_executive_session(p_token text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_exec public.ipma_executives%rowtype;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then
   return jsonb_build_object('ok',false,'error','INVALID_SESSION');
 end if;
 select * into v_exec from public.ipma_executives
 where session_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 and session_expires_at > clock_timestamp() and status='ACTIVE';
 if not found then return jsonb_build_object('ok',false,'error','INVALID_SESSION'); end if;
 return jsonb_build_object('ok',true,'executive_id',v_exec.id,'name',v_exec.name,'status','ACTIVE');
end;
$$;
revoke all on function public.ipma_set_executive_pin(text,text,text),
 public.ipma_authenticate_executive(text,text), public.ipma_validate_executive_session(text)
 from public, anon, authenticated;
grant execute on function public.ipma_set_executive_pin(text,text,text),
 public.ipma_authenticate_executive(text,text), public.ipma_validate_executive_session(text)
 to service_role;
