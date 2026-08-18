# Global News24 v3.1.10 — 관리자 기사등록·수정 시스템

## 이번 ZIP에 들어 있는 파일만 GitHub에 업로드하세요.
기존 파일이나 폴더는 삭제하지 않습니다.

### 추가 파일
- `admin-news.html` — 기사 편집실
- `assets/css/admin-news.css` — 편집실 전용 디자인
- `assets/js/news-admin.js` — 기사 등록·수정·삭제·JSON 내보내기

### 수정 파일
- `index.html` — 버전 표시 v3.1.10
- `pages/article/index.html` — 버전 표시/캐시 v3.1.10

## 관리자 페이지 주소
`https://news24.ai.kr/admin-news.html`

메인 메뉴에는 관리자 페이지 링크를 노출하지 않았습니다.

## 사용 순서
1. 관리자 페이지 접속
2. 기사 선택 또는 `+ 새 기사`
3. 제목·본문·카테고리·사진 등 입력
4. `현재 기사 저장`
5. 상단 `news.json 내려받기`
6. GitHub의 `data/news.json`에 교체 업로드
7. 새 사진을 선택했다면 `이미지 파일 내려받기` 후 GitHub의 `assets/images/news/`에 업로드

## 중요
GitHub Pages는 정적 홈페이지이므로 이 버전의 관리자 화면은 저장소에 직접 쓰지 않습니다.
따라서 관리자 페이지를 다른 사람이 열어도 실제 홈페이지 기사나 GitHub 저장소를 직접 수정할 수 없습니다.
향후 Supabase 인증·DB·Storage를 연결하면 로그인 후 `발행` 버튼으로 바로 등록·수정하는 2단계 관리자 시스템으로 확장할 수 있습니다.
