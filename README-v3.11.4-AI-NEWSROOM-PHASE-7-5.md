# GLOBAL NEWS24 AI NEWSROOM — PHASE 7-5
Version: v3.11.4

## 완료
- 기자가 AI 기사 초안을 확인한 뒤 `확인 완료 · 본사 편집데스크로 보내기` 실행 가능
- 신규 JWT 보호 Edge Function `gn24-reporter-confirm-draft` 배포
- 본인 reporter_id 소유 자료 + ai_draft 상태 + 실제 AI 초안 존재 조건을 모두 확인
- 확인 시 상태를 editor_review로 전환하여 기존 본사 AI 편집데스크 흐름에 연결
- 기자가 직접 DB에서 ai_draft → editor_review를 변경하도록 RLS를 느슨하게 만들지 않음
- 자동발행 없음, 기존 최종관리자 승인 발행 원칙 유지

## PHASE 7 최종 흐름
기자 손안의 마법사 → 음성/텍스트 취재 → 현장사진 첨부 → 본사 제출 → AI 초안 → 기자 원문/AI 비교 → 기자 확인 → 본사 편집데스크 → AI 편집점검/수동편집 → 최종관리자 승인 → 기사발행.

## 회귀·보안 확인
- 기존 reporter submission RLS에서 기자는 draft/revision_requested만 직접 UPDATE 가능함을 확인.
- 따라서 기자 확인 전용 서버 함수로 최소 상태전환만 허용.
- service role은 브라우저/GitHub에 노출하지 않고 Edge runtime에서만 사용.
- 테스트용 기자/취재/기사를 생성하지 않음.
- 기존 간편취재, 음성취재, 기자증, 진행상태, 편집데스크 기능 유지.

## PHASE 7 완료
7-1 모바일 손안의 마법사
7-2 사진 직접 첨부
7-3 말하기+사진 한 화면
7-4 AI 초안 생성/비교
7-5 기자 확인→본사 편집 연결 및 회귀점검

## 다음
PHASE 8 — AI NEWSROOM 통합 운영·보안·출시 준비.