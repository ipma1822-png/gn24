# Global News24 v3.3.1 — 기자 시스템 1단계

## 먼저 Supabase
`SUPABASE-REPORTERS-v3.3.1.sql` 전체를 SQL Editor에서 실행합니다.

## GitHub 교체/추가
- admin-news.html
- index.html
- assets/css/admin-news.css
- assets/css/style.css
- assets/js/news-admin.js
- assets/js/news-cms.js
- assets/js/app.js
- assets/js/reporters.js (신규)
- pages/article/index.html
- pages/reporters/index.html (신규)

## 관리자 기능
- 상단 `👤 기자 관리`
- 활동 / 승인대기 / 활동정지
- 기자 ID, 이름, 직책, 소속, 지역, 사진 URL, 전문분야, 공개 이메일, 소개, 표시순서
- 기사 편집 시 `등록 기자` 선택
- 선택하면 기사 표시 작성자 자동 입력
- 온라인 저장 시 `gn24_articles.reporter_id`로 연결

## 공개 사이트
- 메인 전체메뉴에 `기자소개`
- `/pages/reporters/` 기자 목록
- `/pages/reporters/?id=기자ID` 기자 상세 + 해당 기자 기사 자동 모음
- 기사 하단 기자 카드가 등록 기자 프로필과 자동 연결

## 기존 기사
기존 기사의 `author` 문자열은 그대로 유지됩니다.
기존 기사를 특정 기자 프로필과 연결하고 싶을 때 관리자 편집실에서 `등록 기자`를 선택한 뒤 온라인 저장하면 됩니다.

## 다음 단계
v3.3.2에서는 기자 개인 로그인 / 기자별 기사 작성·송고 / 관리자 승인·반려 / 기자 대시보드로 확장할 수 있습니다.
