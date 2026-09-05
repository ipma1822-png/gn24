# GLOBAL NEWS24 AI NEWSROOM — PHASE 8-3
Version: v3.12.2

## 목표
기자 모바일 사용 중 세션 만료로 취재·사진업로드·AI 확인 화면이 갑자기 끊기는 문제를 줄이고 로그인 복귀주소를 안정화한다.

## 완료
- 기자 전용 공통 세션 helper `assets/js/gn24-reporter-auth.js` 추가
- access token 만료 120초 전 refresh token으로 자동 갱신
- refresh 실패 시 오래된 세션을 제거하고 재로그인 안내
- 기자센터 Magic Link 복귀주소를 현재 임의 URL이 아닌 `/pages/reporter-center/` 기준 canonical URL로 고정
- `?next=wizard` 복귀 흐름 유지
- 기자센터, 손안의 마법사, 기자증, 간편취재, 음성+사진 취재, 내 취재·AI 기사 화면의 세션 갱신 로직 강화
- 각 주요 기자 모바일 화면 버전 표기를 PHASE 8-3 · v3.12.2로 정리

## 보존
- 기존 `gn24-reporter-session` 저장키 유지
- Supabase anon/publishable key만 브라우저에서 사용
- service_role/DB password/OpenAI secret 미노출
- 기자 RLS와 최종관리자 발행권한 변경 없음
- 취재·사진·AI·편집 흐름 변경 없음

## 검증 한계
실제 refresh token은 로그인한 기자 브라우저 세션에서만 생성되므로 운영 계정의 실시간 만료/갱신 시나리오는 가짜 계정을 만들지 않고 코드 경로와 Supabase Auth 표준 refresh endpoint 기준으로 구현했다.

## 다음
PHASE 8-4 — 전체 모바일·회귀시험, 운영 백업/복구 점검, 출시 체크리스트 정리.