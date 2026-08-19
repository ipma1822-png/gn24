# Global News24 v3.2.8 — 관리자 목록 자동갱신

이번 버전은 저장 후 왼쪽 기사 목록이 예전 제목으로 남는 현상만 수정합니다.

변경 파일
- admin-news.html
- assets/js/news-admin.js
- assets/js/news-cms.js

동작
1. 관리자 편집실에서 제목/카테고리/본문 등을 수정
2. `온라인 저장·발행` 클릭
3. Supabase 저장 성공
4. 저장된 DB 행을 즉시 관리자 편집실에 반영
5. 왼쪽 기사 목록 제목도 즉시 갱신

기존 DB, Storage 이미지 업로드, news.json 백업, 메인페이지 기능은 변경하지 않습니다.
