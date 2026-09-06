-- GLOBAL NEWS24 AI NEWSROOM v3.12.10
-- Reporter submission permission fix
-- Production project: GLOBAL-NEWS24

-- Reporters authenticate through Supabase Auth and RLS decides row ownership.
-- The table had reporter RLS policies, but authenticated was missing DML grants,
-- so valid reporter INSERT/SELECT/UPDATE requests were blocked before RLS could allow them.

grant select, insert, update on table public.gn24_reporter_submissions to authenticated;

-- Least-privilege hardening: reporters do not need these table-level privileges.
revoke delete, truncate, references, trigger on table public.gn24_reporter_submissions from authenticated;
revoke select, insert, update, delete, truncate, references, trigger on table public.gn24_reporter_submissions from anon;

-- Existing RLS policies remain authoritative for which rows authenticated users can read/write.
