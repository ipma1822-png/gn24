# GLOBAL NEWS24 — 대전 우리지역 소식센터 MASTER

상태: 개발 설계 확정 / 실제 구현 전
대상: 대전지역판만 활성화. 16개 지역 확장 보류.

## 불변 조건
- main, 기존 기사 클릭(/pages/article/?id=...), 공유(/share/...), SEO, 광고, 본사/해외판 동작 보존.
- 기존 기능/DB/RLS/관리자 구조 확인 후 재사용. 무단 전체 리팩터링 금지.
- 대전 MASTER는 공통 지역 설정을 사용하되 대전만 노출.

## MVP
1. 대전 지역판 '우리지역 소식' 메뉴 및 6분류(경조사, 행사, 인물 동정, 개업·이전, 단체 소식, 지역 알림).
2. 공개 접수 폼: 지역 대전 고정, 분류, 제목, 내용, 일시/장소, 사진, 신청자 연락처(비공개), 개인정보 및 제3자 게시권한 확인. 서버 검증/스팸방지/파일 검사.
3. 대전 지사장 전용 검토함: 대전 데이터만 읽기/검토/수정 요청. 본사만 최종 승인·게시.
4. 접수→검토→수정 요청/반려→본사 승인 대기→게시→종료/비공개. 미승인 데이터는 공개 API에서 차단.
5. 만료 시 목록 비노출. 개인정보 보유기간과 파기 처리 별도. 부고는 유족 등 권한 확인 및 신속 삭제.
6. 광고성 게시물은 명확히 표시. 결제/정산 기능은 이번 단계에서 제외.

## 데이터 모델 검토 항목
기존 테이블 재사용 여부 우선 확인. 필요한 경우 region_code, category, title, body, event_at, place, image, submitter_contact(비공개), status, consent_record, publish_at, expires_at, deletion_at, reviewer, approver, audit_log 등 최소 필드만 추가. 민감 연락처 공개 SELECT 금지. 지역 RLS 정책 및 서버 측 승인 검증.

## 검증/승인 게이트
- 대전 PC/모바일 접수·목록·상세·게시·만료·삭제.
- 타 지역 지사장 접근 차단, 미승인 정보 노출 차단, 악성 입력·파일·스팸 방어.
- 기존 대전 기사 카드/배너 클릭 HTTP 200, /share/ 주소 정상, 국내 17개 지역 회귀 검사.
- 대전 실제 운영 검증 결과와 변경 파일/커밋/배포 상태 보고.
- **대전 MASTER 운영 승인 전 나머지 16개 지역 활성화 금지.**

## 구현 순서
현행 코드/DB 조사 → 기존 구조 재사용 설계 → 대전 기능 개발 → 브랜치 검증 → 승인 후 배포 → 대전 실사용 검증 → 전국 확대 별도 승인.

## 2026-10-29 실사 확인
- 실제 대전판: `daejeon/index.html`, `body[data-region=daejeon]`, `data-hq-code=DAEJEON`.
- 기존 지사 운영센터 링크: `/regional-center/?region=daejeon`. 따라서 별도 관리자 시스템을 신설하기보다 기존 인증/권한 구조 확인 후 재사용.
- Supabase 프로젝트 `GLOBAL-NEWS24` 확인. 공개 스키마에 `gn24_articles`, `gn24_regional_branches`, `gn24_regional_headquarters` 등 존재. `gn24_regional_branches`에는 code, hq_code, head_reporter_id, status 필드 존재.
- **주의:** 테이블 존재만으로 지사장 로그인과 본사 승인 권한이 안전하게 구현됐다는 뜻은 아님. RLS와 기존 관리자 권한 로직을 조사한 후 접수·승인 연결.
- 현재 대전 커뮤니티 화면은 개인정보를 수집하지 않는 프리뷰. 데이터베이스 쓰기/게시 기능 미구현. 운영 main 미배포.
- 다음 단계: 기존 지역 운영센터의 실제 파일·인증/권한 구조 파악, 신규 접수 데이터의 별도 저장 및 비공개 접근 정책 설계, 브랜치에서 E2E 테스트 후 배포 승인.

## 기존 제보 시스템 보안 감사 — 구현 차단 조건
- 실제 접수 페이지 `/pages/contact/?region=daejeon`는 query parameter `region`을 읽어 대전을 사전 선택함. 대전 시범 링크를 이 경로로 수정함.
- 기존 관리자 `/pages/admin-local-tips/`는 `gn24_participant_submissions`를 읽고 상태 `submitted/reviewing/clarification_requested/accepted/published/rejected`를 PATCH함. 지역 본부장 접근은 `gn24_my_regional_scope` RPC로 결정.
- **중요 발견:** 현재 `gn24_participant_submissions` UPDATE RLS는 본사 관리자 또는 담당 지역본부장에게 해당 지역 행 UPDATE를 허용하지만, `status='published'` 전환을 본사 전용으로 제한하는 조건은 확인되지 않음. UI에서 버튼을 숨기는 것만으로 해결 불가. 별도 소식센터 게시 승인 구현 전 반드시 서버 측 권한/상태 전이 검증을 추가해야 함.
- 현행 제보 상태 `published`는 실제 기사의 공개 게시와 동일하지 않을 수 있으므로 소식센터 공개 게시와 혼동하지 말 것.
- 기존 제보 시스템의 운영 RLS를 바로 변경하면 다른 17개 지역에 영향을 줄 수 있으므로, 우선 **대전 전용 신규 데이터/승인 RPC 및 격리된 RLS 설계·테스트**를 거쳐 도입. 운영 DB 변경 미실행.
- 기존 접수 폼의 유형은 '기사제보/보도자료/행사소식/인터뷰 제안/사진제보/기관소식/광고·협력문의/기타문의'로, 소식센터 6분류와 다름. 현 단계에서는 정식 소식센터 분류/게시 기능이 완성됐다고 표시 금지.
