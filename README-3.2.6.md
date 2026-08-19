# Global News24 v3.2.6 — 대표이미지 Supabase Storage 자동 업로드 보강

변경 파일만 포함합니다.

- admin-news.html
- assets/js/news-admin.js
- assets/js/news-cms.js

## 핵심 수정
- 관리자 편집실에서 새 이미지를 선택한 뒤 `온라인 저장·발행`하면 `news-images` 버킷에 자동 업로드
- 파일 입력값이 브라우저에서 사라져도 IndexedDB 임시저장 이미지에서 다시 찾아 업로드
- 업로드 후 공개 URL을 `gn24_articles.image`에 자동 저장
- 업로드 성공 후 임시 이미지 저장본 자동 정리
- 기존 GitHub 이미지 경로와 이미지 내려받기 기능은 비상용으로 유지

## 테스트 순서
1. GitHub에 3개 파일을 같은 경로로 덮어쓰기
2. 관리자 편집실에서 Ctrl+F5
3. 새 기사 또는 기존 기사에서 새 이미지 선택
4. `온라인 저장·발행` 클릭
5. Supabase Storage > news-images에서 날짜/기사ID 폴더와 이미지 확인
6. Table Editor > gn24_articles의 image 값이 supabase.co/storage/v1/object/public/... URL인지 확인
