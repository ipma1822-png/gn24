# Global News24 v3.2.19 — 조회수 + 많이 본 뉴스

## 먼저 Supabase
`SUPABASE-VIEWS-v3.2.19.sql` 전체를 SQL Editor에서 실행합니다.

## GitHub 교체 파일
- pages/article/index.html
- assets/js/app.js
- assets/css/style.css

## 기능
- 기사 상세페이지 열 때 실제 조회수 +1
- 기사 상단에 조회수 표시
- 우측 사이드바에 많이 본 뉴스 TOP 10 자동 표시
- TOP 10 옆에 각 기사 조회수 표시
- 기존 댓글·반응·16:9 이미지·기사 본문·최신뉴스 기능 유지

※ 단순하고 안정적인 1차 조회수입니다. 같은 사람이 새로고침하면 조회수가 다시 증가합니다.
추후 필요하면 방문자/시간 기준 중복조회 방지로 고도화할 수 있습니다.
