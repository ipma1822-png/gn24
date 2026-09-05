# GLOBAL NEWS24 AI NEWSROOM — PHASE 8-1
Version: v3.12.0

## 목적
통합 운영 전 첫 보안 점검으로 공개 기자 디렉터리와 기자 개인정보 노출 경로를 우선 점검·보강한다.

## 확인된 문제
`gn24_reporters`는 anon 역할에 테이블 SELECT 권한이 있었고, 공개 활성 기자 행에 대해 RLS가 허용되어 있었다. 공개 화면 자체는 필요한 컬럼만 요청했지만, REST API에서 `select=*`를 직접 호출하면 `login_email` 같은 내부 컬럼이 함께 노출될 가능성이 있었다.

## 조치
- 공개 기자 목록 전용 `gn24_public_reporters()` RPC 추가
- RPC는 SECURITY INVOKER로 구성
- anon의 테이블 전체 SELECT 권한 제거
- anon에는 공개에 필요한 컬럼만 column-level SELECT 허용
- `login_email`, `access_level`, `source_application_id`, 내부 시간 컬럼 등은 anon SELECT 불가
- anon과 authenticated의 기자 SELECT RLS 정책을 분리
- 공개 기자 화면 `assets/js/reporters.js`를 안전 RPC 사용 방식으로 변경
- 기자소개 페이지 cache/version을 v3.12.0으로 갱신

## 검증
- anon `login_email` SELECT 권한: false
- anon 공개 `name` SELECT 권한: true
- anon `gn24_public_reporters()` 실행 권한: true
- anon 역할에서 공개 기자 RPC 실행 정상: 2명
- 공개 기자 디렉터리 기능 유지

## 현재 Supabase Security Advisor 잔여 항목
이번 변경으로 `gn24_public_reporters()` 관련 SECURITY DEFINER 경고는 제거됐다. 남은 항목은 기존 기능 관련 사항으로 다음 단계에서 영향 분석 후 처리한다.
- `gn24_admins`: RLS enabled, no policy (INFO)
- `gn24_increment_article_view`: anon/authenticated SECURITY DEFINER 경고
- `gn24_approve_reporter_application`: authenticated SECURITY DEFINER 경고
- `gn24_my_access_level`, `gn24_my_reporter_id`, `is_gn24_admin`: authenticated SECURITY DEFINER 경고
- Supabase Auth leaked password protection disabled

기존 인증·RLS가 의존하는 identity helper 함수는 이번 단계에서 무리하게 변경하지 않았다.

## 다음
PHASE 8-2 — 중복 제출·감사 로그·운영 추적 기반 보강.