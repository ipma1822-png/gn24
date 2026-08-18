# Global News24 v3.2.1 — Supabase 실제 저장 연결판

## GitHub 선별 업로드 파일
- admin-news.html
- assets/js/news-cms.js
- assets/css/admin-news.css
- README-3.2.1.md

## Supabase에서 별도로 한 번 실행
- SUPABASE-UPGRADE-v3.2.1.sql

## 핵심 기능
- 관리자 이메일 + 비밀번호 로그인
- gn24_admins 등록 관리자만 쓰기 허용
- 현재 기사 Supabase DB 저장/수정(upsert)
- 공개/비공개 저장
- 새 대표이미지 news-images Storage 직접 업로드
- 온라인 DB 기사 삭제
- 기존 data/news.json 19개 기사 일괄 DB 이관
- v3.1.12 자동 임시저장/이미지 복원과 news.json 백업 기능 유지

## 중요: 최초 관리자 준비
1. Supabase > Authentication > Users에서 관리자 계정을 만듭니다.
2. SQL Editor에서 SUPABASE-UPGRADE-v3.2.1.sql 전체를 실행합니다.
3. 파일 맨 아래 예시 INSERT의 YOUR_ADMIN_EMAIL을 실제 관리자 이메일로 바꾸어 별도로 실행합니다.
4. /admin-news.html에서 관리자 로그인 후 "기존 기사 DB 이관"을 한 번 실행합니다.

※ Secret key / service_role key / Database password는 웹 코드에 넣지 않습니다.
