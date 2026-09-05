# GLOBAL NEWS24 AI NEWSROOM — PHASE 6-3

Version: **v3.10.2**

## 완료 내용

기자 운영 상세 화면에 최종관리자 전용 기자 관리 기능을 추가했다.

- 활동상태: `active`, `pending`, `suspended`
- 권한: `editor`, `reporter`, `contributor`
- 직책(role) 수정
- 활동정지와 활동복구 빠른 버튼
- 편집자(editor)는 조회 전용
- 최종관리자(admin)에게만 변경 UI 표시

## 보안

기존 `gn24_reporters` RLS를 그대로 사용한다.

- `admins manage reporters`: authenticated + `is_gn24_admin()` 조건에서 ALL
- 편집자에게 기자 UPDATE 권한을 새로 부여하지 않음
- 브라우저에 service_role 키를 사용하지 않음
- 공개 프로필에는 기존 public read 정책만 적용

## 운영 원칙

기자 상태 또는 권한을 바꾸더라도 기존 기사와 취재기록은 삭제하지 않는다. 활동정지는 접근·활동상태를 제한하는 운영 조치이며 데이터 삭제가 아니다.

## 변경 파일

- `pages/admin-reporter-detail/index.html`
- `assets/js/reporter-detail-admin.js`
- `pages/admin-reporter-network/index.html`

## 다음 단계

PHASE 6-4 — 지역·전문분야 기반 기자 네트워크 운영/배치 시각화.