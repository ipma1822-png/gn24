-- GN24 JUNIOR PRESS — PHASE 3 secure apply/login foundation
create table public.gn24_junior_sessions (
  id uuid primary key default gen_random_uuid(),
  junior_reporter_internal_id bigint not null references public.gn24_junior_reporters(internal_id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint gn24_junior_sessions_expiry_valid check (expires_at > created_at)
);
create index gn24_junior_sessions_reporter_active_idx on public.gn24_junior_sessions(junior_reporter_internal_id, expires_at desc) where revoked_at is null;
create table public.gn24_junior_login_attempts (
  id bigint generated always as identity primary key,
  reporter_id text not null,
  request_fingerprint_hash text not null,
  succeeded boolean not null default false,
  created_at timestamptz not null default now(),
  constraint gn24_junior_login_attempts_reporter_id_format check (reporter_id ~ '^GN24-JR-[0-9]{4}$')
);
create index gn24_junior_login_attempts_rate_idx on public.gn24_junior_login_attempts(reporter_id, request_fingerprint_hash, created_at desc);
alter table public.gn24_junior_sessions enable row level security;
alter table public.gn24_junior_login_attempts enable row level security;
revoke all on table public.gn24_junior_sessions from public, anon, authenticated;
revoke all on table public.gn24_junior_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on table public.gn24_junior_sessions to service_role;
grant select, insert, delete on table public.gn24_junior_login_attempts to service_role;
comment on column public.gn24_junior_sessions.token_hash is 'SHA-256 session token digest. Plaintext session tokens are prohibited.';
comment on column public.gn24_junior_login_attempts.request_fingerprint_hash is 'SHA-256 request fingerprint digest. Raw IP addresses are not stored.';
