# Global News24 v3.2.4 — Supabase 공개기사 읽기 수정

변경 파일
- index.html
- assets/js/app.js

수정 내용
- 새 Supabase Publishable Key를 Authorization: Bearer 헤더에서 제거
- 공개 기사 REST 조회에는 apikey 헤더만 사용
- Supabase 조회 실패 시 기존 data/news.json fallback 유지
- 화면 버전 및 app.js 캐시 버전을 v3.2.4로 갱신

GitHub 저장소에 폴더 구조 그대로 덮어쓰기 하세요.
