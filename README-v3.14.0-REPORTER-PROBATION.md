# GLOBAL NEWS24 v3.14.0 — 수습기자 3개월 관리 시스템

## 목적
공식 5년 운영정책 v1.0의 수습기자 제도를 실제 운영시스템에 반영한다.

## 핵심 정책
- 정식 기자 지원 승인 후 원칙적으로 3개월 수습.
- 수습기간 운영분담금 무료.
- 3개월 경과만으로 자동 정식위촉하지 않음.
- 본사 관리자가 정식위촉, 30일 연장, 수습종료, 특별 수습면제를 결정.
- 수습단계(career_stage)와 활동상태(status)는 분리 관리.
- 모든 수습 인사변경은 gn24_reporter_personnel_audit에 기록.

## DB 변경
`gn24_reporters`에 아래 필드를 추가했다.
- career_stage: probation / official / probation_ended
- probation_start_at
- probation_due_at
- probation_completed_at
- probation_review_status
- probation_exempt
- probation_exempt_reason
- probation_notes
- official_appointed_at

기존 기자는 데이터 보존을 위해 `official`이 기본값이며 기존 appointed_at 또는 created_at을 official_appointed_at에 보정했다.

## 관리자 RPC
`gn24_admin_update_probation(reporter_id, action, reason)`

지원 동작:
- start: 3개월 수습 시작
- approve: 정식기자 위촉
- extend: 예정 종료일 30일 연장
- end: 수습 종료 + 활동 종료 처리
- exempt: 수습면제 후 정식위촉

함수는 SECURITY INVOKER이며 authenticated에만 실행권을 부여한다. 실제 동작 전 `is_gn24_admin()`으로 본사 관리자 여부를 확인한다.

## 신규 지원 승인 흐름
기존 `gn24_approve_reporter_application()`의 구조와 기자번호 발급 흐름을 유지하면서, 신규 승인 기자는 다음 값으로 생성되도록 변경했다.
- career_stage = probation
- probation_start_at = 승인 시각
- probation_due_at = 승인 시각 + 3개월
- probation_review_status = in_progress
- reporter_rank = 기자
- reporter_type = 지원유형 기반

## 관리자 화면
- `/pages/admin-reporter-probation/`
- 본사 관리자 전용
- 전체/수습중/정식/수습종료 필터
- 7일 이내 종료예정 인원 표시
- 정식위촉/30일 연장/수습종료/수습면제 처리

## 기존 시스템 보호
- 기존 기자의 status, access_level, reporter_rank, 기사·제출·인사기록 구조를 재설계하지 않았다.
- 기존 PHASE 7-1~7-11 기능을 유지한다.
- 루트 `index.html`은 수정 대상이 아니다.

## 버전
GLOBAL NEWS24 REPORTER PROBATION v3.14.0