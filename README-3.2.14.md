# Global News24 v3.2.14 — 기사 기능 도구 패치

변경 파일
- pages/article/index.html
- assets/js/app.js
- assets/css/style.css

추가 기능
- 기사 상단/하단 공유 버튼: Facebook, X, BAND, Telegram, 모바일 시스템 공유
- 기사 목록 버튼
- 기사 링크 복사
- 기사 인쇄
- 본문 글자 크게/작게
- 기자 정보 카드
- 좋아요 버튼 (현재 브라우저 localStorage 기반 1차 버전)
- 기사 하단 헤드라인 / 최신기사 자동 표시
- 댓글 영역 UI 준비

중요
- 좋아요는 현재 서버 전체 합계가 아니라 해당 브라우저에 저장되는 1차 기능입니다.
- 댓글은 UI만 먼저 준비했습니다.
- 다음 단계에서 Supabase에 article_likes / article_comments / article_views 같은 테이블을 추가하면
  모든 독자가 공유하는 실제 좋아요 수, 조회수, 댓글로 확장할 수 있습니다.
- 기존 기사 DB, 관리자 편집실, 이미지 Storage는 변경하지 않습니다.
