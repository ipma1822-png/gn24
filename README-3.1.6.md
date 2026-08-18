# Global News24 v3.1.6

기준: v3.1.5 기능/디자인 전부 유지.

## 변경사항
- 2026-08-19 홈페이지 재오픈 공지 기사를 정식 기사 데이터로 추가
- 기사 이미지가 없거나 기존 이미지가 깨졌을 때 `gn24-default-news.svg`가 자동 표시되도록 공통 fallback 처리
- 메인 최신/주요 뉴스는 기사 날짜 기준 최신순 정렬
- `pinned` 기사를 메인 TOP NEWS 우선 노출 가능
- 공익 영역은 ACTS/선교 키워드 대신 공익·봉사·지역사회 중심으로 분류
- CSS/JS 캐시 버전 v3.1.6으로 통일

## 기사 추가 방법
`data/news.json` 배열 맨 앞 또는 아무 위치에 새 기사 객체를 추가합니다. 날짜 기준으로 메인에서 자동 정렬됩니다.
필수 권장 필드: id, title, date, category, summary, image, author, content.
메인 대표기사로 고정하려면 `pinned: true`, 강조기사로 쓰려면 `featured: true`를 사용합니다.
