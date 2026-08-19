# Global News24 v3.2.9 — 비공개 기사 독자화면 완전 차단

변경 파일
- index.html
- assets/js/app.js

수정 내용
- Supabase REST 조회에서 `is_published=eq.true` 조건 유지
- 조회 결과에도 `isPublished !== false` 2차 필터 적용
- 메인 TOP NEWS / 최신뉴스 / 주요뉴스 / 분야별 뉴스 / 뉴스룸 / 기사 상세페이지 모두
  공통 `publicOnly()` 필터를 거치도록 보강
- 비공개 기사는 관리자 편집실에서는 유지되지만 일반 홈페이지에서는 표시되지 않음
- 기존 news.json fallback 유지

업로드 후 Ctrl+F5로 확인하세요.
