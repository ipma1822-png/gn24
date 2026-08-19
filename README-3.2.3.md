# Global News24 v3.2.3 — Supabase 공개기사 자동연동

업로드 파일:
- assets/js/app.js
- README-3.2.3.md

핵심:
- 메인/뉴스룸/기사상세가 Supabase `gn24_articles`의 `is_published=true` 기사부터 읽습니다.
- DB 컬럼(snake_case)을 기존 홈페이지 기사 구조로 자동 변환합니다.
- `content`, `tags`, `related_orgs`가 문자열/배열 어느 형태여도 최대한 안전하게 읽습니다.
- Supabase 연결 실패 또는 기사 0건이면 기존 `/data/news.json`으로 자동 fallback 합니다.
- 기존 디자인, 메뉴, 기사 상세 구조는 삭제하지 않습니다.
