# GLOBAL NEWS24 v3.13.10 — PHASE 7-10

## 기자 교육·윤리·징계·포상 기록 시스템

이번 단계는 기자 승급심사에 기사 수와 취재 제출 수뿐 아니라 본사의 공식 인사기록을 연결한다.

### 공식 기록 종류
- `training` 교육이수 — 기본 참고점수 +5
- `award` 본사포상 — 기본 참고점수 +10
- `flagship` 대표기획 — 기본 참고점수 +15
- `warning` 경고 — 기본 참고점수 -10
- `discipline` 징계 — 기본 참고점수 -30

점수는 본사 심사용 참고지표이며 자동승급을 결정하지 않는다. 최종 기자 인사권과 승급 결정권은 GLOBAL NEWS24 본사에 있다.

### Supabase
신규 테이블 `public.gn24_reporter_records`를 사용한다. RLS를 활성화하고 익명 접근은 차단했다. 본사 관리자만 INSERT/UPDATE할 수 있으며 관리자와 편집자는 SELECT할 수 있다.

기록은 물리 삭제하지 않고 `active` → `revoked` 상태로 취소한다. 취소 시각·취소자·사유를 남겨 인사이력을 보존한다.

신규 RPC `gn24_admin_promotion_metrics_v2()`는 기존 기사·취재·활동기간·인사감사 기록에 교육·포상·대표기획·경고·징계 집계를 추가한다. 함수는 `SECURITY INVOKER`이며 anon 실행권한은 없다.

### 관리자 화면
- `/pages/admin-reporter-records/` — 교육·윤리·징계·포상 기록센터
- `/pages/admin-reporter-promotions/` — v2 인사기록 통합 승급심사
- `/pages/admin-reporter-operations/` — 인사기록센터 진입 링크 추가

### 승급심사 반영
기존 활동기간·공개기사·취재제출 조건은 유지한다. 활성 경고 또는 징계가 있으면 자동 승급후보로 표시하지 않으며 본사 검토 대상으로 남긴다. 인사 참고점수는 화면에 별도 표시한다.

### 검증
실제 기자를 대상으로 테스트 인사기록을 트랜잭션 안에서 생성한 뒤 ROLLBACK하여 운영 데이터는 남기지 않았다. 테스트 INSERT가 정상 동작했고 최종 `gn24_reporter_records` 운영 행 수는 0건이었다. 신규 함수와 감사 트리거 함수는 모두 `SECURITY INVOKER`, anon EXECUTE=false, authenticated EXECUTE=true를 확인했다.

### 보호 원칙
루트 `/index.html`은 PHASE 7-10에서 수정하지 않는다. 기자 시스템 작업은 기자 관련 관리자 페이지·JS·Supabase 구조에만 한정한다.
