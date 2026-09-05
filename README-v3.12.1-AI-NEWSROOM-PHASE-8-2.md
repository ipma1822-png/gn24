# GLOBAL NEWS24 AI NEWSROOM — PHASE 8-2
Version: v3.12.1

## 목표
- 기자의 반복 임시저장/재전송으로 동일 취재 건이 여러 행으로 생기는 문제를 줄인다.
- 취재자료 생성·수정·상태변경을 자동 감사기록으로 남긴다.

## Supabase
- `gn24_reporter_submissions.client_submission_key` 추가.
- `(reporter_id, client_submission_key)` 부분 UNIQUE 인덱스로 동일 클라이언트 취재 흐름 중복 INSERT 차단.
- `gn24_submission_audit` 생성.
- 감사기록은 취재 원문/연락처 전체 복사 대신 action, 이전/이후 status, actor_user_id, changed_fields, timestamp 중심으로 저장.
- anon 접근 없음.
- authenticated 직접 INSERT/UPDATE/DELETE 불가.
- 관리자/편집자만 SELECT 가능.
- INSERT/UPDATE trigger가 자동 기록.
- trigger function API execute 권한은 revoke하여 직접 호출 불가.

## 모바일 기자 화면
- 간편취재와 음성+사진취재 모두 한 화면 세션에서 안정적인 `client_submission_key`를 생성.
- 첫 임시저장 후 동일 submission ID를 계속 PATCH하여 반복 저장이 새 행을 만들지 않음.
- 이미 업로드된 같은 사진은 같은 화면 세션에서 다시 업로드하지 않음.
- 최종 본사 전송 완료 후 새 취재 흐름 키를 생성.

## 운영 UI
- `/pages/admin-audit/` 추가.
- 관리자/편집자는 최근 100건의 생성·상태변경·내용수정 기록을 확인 가능.
- 기자 운영 통합센터에 운영기록 진입점 추가.

## 보존
- 기존 기자 RLS와 최종관리자 승인 발행 원칙 유지.
- 기존 취재자료/기사 데이터 삭제나 backfill 없음.
- 테스트용 가짜 운영 데이터 생성 없음.

## 다음
PHASE 8-3 — 모바일 세션/토큰 안정화, canonical redirect, 장시간 사용 시 인증 회복과 실패 복구.