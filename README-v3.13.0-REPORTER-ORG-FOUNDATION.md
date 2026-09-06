# GLOBAL NEWS24 v3.13.0 — 기자 조직 기반 확장

## PHASE 7-1
기존 기자 시스템을 유지한 채 `gn24_reporters`에 조직·직급 정보를 추가했다.

### 추가 필드
- `reporter_rank`: 기자 / 선임기자 / 수석기자
- `reporter_type`: 일반기자 / 지역기자 / 전문기자 / 객원기자 / 해외통신원 등
- `organization_position`: 편집국장 / 취재부장 / 시·도본부장 / 지부장 등
- `regional_hq_code`: 17개 시·도 지역본부 코드
- `special_designations`: 특임기자 / 논설위원 / 전문위원 등
- `rank_changed_at`: 최근 직급 변경 시각

## 중요 원칙
- 기존 `role` 삭제/변경 없음
- 기존 `access_level` 삭제/변경 없음
- 기자 직급·조직 직책과 시스템 권한은 분리
- 수석기자나 본부장이라고 해서 자동으로 `editor`/`admin` 권한을 부여하지 않음
- 기존 기자로그인, 기자증, 기사작성, AI NEWSROOM, 기사 `reporter_id` 연결 구조 유지
- 기존 RLS 정책 변경 없음

## Supabase 적용
프로덕션 `GLOBAL-NEWS24` 프로젝트에 migration `gn24_reporter_org_foundation_v1` 적용 완료.
기존 기자 데이터는 기본값 `기자`, `일반기자`로 보존됨.

## 다음 단계
PHASE 7-2에서 본사 기자 통합관리 화면에 직급·기자종류·조직직책·지역본부 편집 기능을 추가한다.
