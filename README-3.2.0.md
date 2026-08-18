# Global News24 v3.2.0 — 온라인 편집국 CMS 1단계

## 선별 업로드 파일
- admin-news.html
- assets/js/news-admin.js
- assets/css/admin-news.css
- assets/js/gn24-supabase-config.js
- assets/js/news-cms.js
- SUPABASE-SETUP-v3.2.0.sql

## 이번 버전
v3.1.12의 자동 임시저장/이미지 복원을 그대로 유지합니다.
Supabase 연결 전에는 기존 news.json 방식이 그대로 작동합니다.
Supabase 연결 후 관리자 이메일 로그인, 기사 온라인 발행/수정, 공개/비공개, 대표이미지 Storage 업로드가 가능합니다.

## 연결 순서
1. Global News24용 Supabase 프로젝트에서 SQL Editor를 열고 SUPABASE-SETUP-v3.2.0.sql 실행
2. Project URL과 Publishable/Anon key를 확인
3. assets/js/gn24-supabase-config.js의 url, anonKey에 입력
4. GitHub에 해당 파일만 다시 업로드
5. /admin-news.html에서 관리자 로그인 후 온라인 발행 테스트

주의: anon/publishable key는 브라우저 공개용 키입니다. service_role key는 절대 HTML/JS에 넣지 마세요.
