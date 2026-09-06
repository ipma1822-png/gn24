-- GLOBAL NEWS24 v3.13.4
-- PHASE 7-5 · 17개 시·도본부 공식 관리 기반

create table if not exists public.gn24_regional_headquarters (
  code text primary key,
  name text not null,
  region_name text not null,
  head_reporter_id text null references public.gn24_reporters(id) on update cascade on delete set null,
  status text not null default 'planned' check (status in ('planned','active','suspended','closed')),
  appointed_at timestamptz null,
  term_start date null,
  term_end date null,
  contribution_amount integer not null default 50000 check (contribution_amount >= 0),
  notes text not null default '',
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gn24_regional_headquarters enable row level security;
revoke all on table public.gn24_regional_headquarters from anon;
grant select,insert,update,delete on table public.gn24_regional_headquarters to authenticated;

create policy "gn24 regional hq authenticated read" on public.gn24_regional_headquarters for select to authenticated using (true);
create policy "gn24 regional hq admin insert" on public.gn24_regional_headquarters for insert to authenticated with check (public.is_gn24_admin());
create policy "gn24 regional hq admin update" on public.gn24_regional_headquarters for update to authenticated using (public.is_gn24_admin()) with check (public.is_gn24_admin());
create policy "gn24 regional hq admin delete" on public.gn24_regional_headquarters for delete to authenticated using (public.is_gn24_admin());

insert into public.gn24_regional_headquarters(code,name,region_name,display_order) values
('SEOUL','GLOBAL NEWS24 서울본부','서울',10),('BUSAN','GLOBAL NEWS24 부산본부','부산',20),('DAEGU','GLOBAL NEWS24 대구본부','대구',30),('INCHEON','GLOBAL NEWS24 인천본부','인천',40),('GWANGJU','GLOBAL NEWS24 광주본부','광주',50),('DAEJEON','GLOBAL NEWS24 대전본부','대전',60),('ULSAN','GLOBAL NEWS24 울산본부','울산',70),('SEJONG','GLOBAL NEWS24 세종본부','세종',80),('GYEONGGI','GLOBAL NEWS24 경기본부','경기',90),('GANGWON','GLOBAL NEWS24 강원본부','강원',100),('CHUNGBUK','GLOBAL NEWS24 충북본부','충북',110),('CHUNGNAM','GLOBAL NEWS24 충남본부','충남',120),('JEONBUK','GLOBAL NEWS24 전북본부','전북',130),('JEONNAM','GLOBAL NEWS24 전남본부','전남',140),('GYEONGBUK','GLOBAL NEWS24 경북본부','경북',150),('GYEONGNAM','GLOBAL NEWS24 경남본부','경남',160),('JEJU','GLOBAL NEWS24 제주본부','제주',170)
on conflict (code) do update set name=excluded.name,region_name=excluded.region_name,display_order=excluded.display_order;

create index if not exists gn24_reporters_regional_hq_code_idx on public.gn24_reporters(regional_hq_code);
create index if not exists gn24_regional_headquarters_head_idx on public.gn24_regional_headquarters(head_reporter_id);