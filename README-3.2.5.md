# Global News24 v3.2.5 — 관리자 편집실 DB 기사 직접 불러오기

변경 파일만 포함합니다.

- admin-news.html
- assets/js/news-admin.js
- assets/js/news-cms.js

## 핵심
- 관리자 로그인 후 `Supabase 기사 불러오기` 버튼 사용 가능
- `gn24_articles`의 기사 전체(공개/비공개 포함)를 편집실 왼쪽 목록으로 로드
- DB의 snake_case 필드를 기존 편집실 형식으로 자동 변환
- 공개/비공개 상태도 편집실 체크박스에 반영
- 기존 Local Storage/IndexedDB 임시저장, news.json 백업 기능 유지
- DB 불러오기 시 오래된 Local Storage 기사 초안은 초기화

## 테스트
1. GitHub에 3개 파일을 같은 경로로 덮어쓰기
2. admin-news.html에서 Ctrl+F5
3. 로그인 상태 확인
4. `Supabase 기사 불러오기` 클릭
5. 왼쪽 기사 수가 19건으로 표시되는지 확인
