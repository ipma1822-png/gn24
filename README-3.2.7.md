# Global News24 v3.2.7 — 신규기사 메인 노출 수정

변경 파일
- index.html
- assets/js/app.js

수정 내용
- Supabase의 created_at / updated_at을 메인 기사 데이터에 유지
- 같은 날짜의 기사들은 실제 DB 등록시간(created_at) 기준 최신순 정렬
- 새로 발행한 기사가 메인 최신/주요 카드 영역에 즉시 진입
- 기존 pinned(상단 고정) 대표기사는 그대로 유지
- Supabase Storage 공개 이미지 URL도 기존 방식 그대로 사용
- Supabase 장애 시 data/news.json fallback 유지

업로드 후 Ctrl+F5로 강력 새로고침하세요.
