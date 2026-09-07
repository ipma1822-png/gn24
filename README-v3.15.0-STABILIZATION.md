# GLOBAL NEWS24 v3.15.0 — 통합 안정화·보안점검

## 이번 단계에서 실제 반영한 내용
1. Supabase security advisor 재점검.
2. `gn24_admins`에 관리자 본인검증 기반 SELECT RLS 정책 추가.
3. `gn24_reporter_auth_requests`에 본인 또는 본사 관리자만 조회 가능한 SELECT RLS 정책 추가.
4. 관리자·기자 인증 관련 SECURITY DEFINER RPC에서 `public`, `anon` 실행권 제거 후 `authenticated`만 명시 허용.
5. 공개 기사 조회수 증가 RPC는 공개 뉴스 기능 유지 때문에 anon 호출을 유지하고 추후 rate-limit/abuse hardening 대상으로 기록.
6. 공식 운영정책 v1.1 최소 정정본 발행: 운영분담금 상태를 `정상/미납/유예/면제`로 통일하고 `종료`를 납부상태에서 제거. 본사 운영이사 명칭이 법인 등기이사·지분·소유권을 의미하지 않는다는 점 명문화.

## 남아 있는 보안 Advisor 경고
- 공개 기사 조회수 증가 SECURITY DEFINER 함수: 공개 카운터 특성상 현재 유지.
- authenticated가 호출해야 하는 기존 SECURITY DEFINER 함수들: 함수 내부 본인/관리자 검증을 사용 중. 향후 구조개편 시 별도 private schema 또는 더 좁은 RPC 구조 검토.
- Supabase Auth leaked password protection: 프로젝트 설정에서 활성화 필요.

## 변경하지 않은 것
- 메인 `index.html`
- 기존 기사 발행 흐름
- 기존 기자·지역·분담금 데이터
- 아직 본사에서 확정하지 않은 시행일·납부기한·연납주기·중도정산 규칙

## Version
v3.15.0
