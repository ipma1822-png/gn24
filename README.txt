Global News24 v3.4.2 Kakao direct-share fix

GitHub repository root에 폴더 구조 그대로 덮어쓰기:
- assets/js/app.js
- assets/js/gn24-kakao-config.js
- pages/article/index.html

수정 내용:
- Kakao SDK가 늦게 로드되거나 누락돼도 버튼 클릭 시 자동 로드
- JavaScript 키 초기화 안정화
- 캐시 버전 v3.4.2 적용
- 기존 기사/기자/Supabase/푸터/공유 URL 구조 유지
