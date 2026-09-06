-- GLOBAL NEWS24 v3.13.0
-- PHASE 7-1: Reporter organization foundation
-- Additive-only migration. Existing reporter/auth/article/newsroom behavior is preserved.

alter table public.gn24_reporters
  add column if not exists reporter_rank text not null default '기자',
  add column if not exists reporter_type text not null default '일반기자',
  add column if not exists organization_position text not null default '',
  add column if not exists regional_hq_code text not null default '',
  add column if not exists special_designations text[] not null default '{}'::text[],
  add column if not exists rank_changed_at timestamptz;

comment on column public.gn24_reporters.reporter_rank is 'GN24 공개 기자 직급: 기자/선임기자/수석기자';
comment on column public.gn24_reporters.reporter_type is 'GN24 기자 활동 유형: 일반기자/지역기자/전문기자/객원기자/해외통신원 등';
comment on column public.gn24_reporters.organization_position is 'GN24 조직 직책: 편집국장/취재부장/시도본부장/지부장 등. 시스템 access_level과 별개';
comment on column public.gn24_reporters.regional_hq_code is '17개 시도 지역본부 코드 또는 공란';
comment on column public.gn24_reporters.special_designations is '특임기자/논설위원/전문위원 등 특별지정';
comment on column public.gn24_reporters.rank_changed_at is '최근 기자 직급 변경 시각';
