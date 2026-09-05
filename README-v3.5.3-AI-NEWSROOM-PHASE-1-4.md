# Global News24 v3.5.3 · AI NEWSROOM PHASE 1-4 회귀시험

PHASE 1-1~1-3에서 추가한 기자 취재접수·워크플로·권한 정비 후 기존 기능의 데이터·코드 연결 상태를 점검했습니다.

## 점검 결과

- gn24_articles: 58건 유지
  - 공개 56건
  - 비공개 초안 2건
- gn24_reporters: 2명, 모두 active
- gn24_article_comments: 3건 유지
- gn24_article_reactions: 27건 유지
- gn24_article_views: 56행 유지
- gn24_reporter_submissions: 0건(정상 초기 상태)
- 기사→기자 연결 orphan: 0
- 댓글→기사 연결 orphan: 0
- 반응→기사 연결 orphan: 0
- 조회수→기사 연결 orphan: 1
  - article_id: gn24-20260821-493790
  - view_count: 5
  - 과거 삭제/이관 기사로 추정되므로 이번 회귀시험에서는 삭제하지 않음

## 코드 연결 확인

- 메인/현재 기사목록은 app.js에서 Supabase gn24_articles 공개 기사 우선 조회 후 news.json fallback을 사용함.
- 현재 기사 상세 pages/article/는 app.js를 통해 기사 본문·조회수·사이드뉴스·공유 UI를 연결함.
- 기자소개 pages/reporters/는 gn24_reporters active 기자와 기자별 공개기사를 Supabase REST로 조회함.
- 관리자 CMS는 gn24_articles에 직접 upsert하며 기존 기사·이미지·댓글 관리 흐름을 유지함.
- PHASE 1-1~1-3에서 기존 공개 기사 56건, 비공개 2건, 기자 2명, 댓글/반응 데이터가 손실되지 않음.

## 발견한 레거시 영역

- assets/js/newsroom.js 및 assets/js/article.js 일부는 briefs.json/press.json 기반의 구형 코드가 남아 있음.
- pages/read/ 역시 /gn24/ 경로를 사용하는 과거 브리핑 코드가 남아 있음.
- 현재 운영 핵심은 app.js + Supabase 경로이므로 PHASE 1에서는 삭제·대수술하지 않음. 이후 정리 PHASE에서 안전하게 제거 여부를 판단함.

## 보안/정합성 메모

- gn24_admins는 RLS enabled 상태이나 직접 policy가 없는 기존 구조임.
- is_gn24_admin, gn24_my_reporter_id, gn24_my_access_level은 권한 판정에 사용 중인 SECURITY DEFINER 함수이므로 임의 차단 금지.
- gn24_increment_article_view는 공개 조회수 증가 목적의 SECURITY DEFINER 함수로 별도 보안 검토가 필요함.

## 판정

PHASE 1-1~1-3 변경으로 인한 기존 핵심 데이터 손실 또는 권한 구조 파손은 확인되지 않았습니다.

PHASE 1 기반 정비 완료로 판정하고 PHASE 2 기자 모집·등록·승인 시스템으로 진행합니다.
