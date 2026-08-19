# Global News24 v3.2.20 — SNS·카카오 공유

## 변경/추가 파일
- pages/article/index.html
- assets/js/app.js
- assets/css/style.css
- assets/js/gn24-kakao-config.js

## 기능
- 기사 제목/요약/대표이미지/URL을 브라우저의 OG·Twitter 메타정보로 자동 갱신
- 카카오톡 전용 공유 버튼 추가
- 카카오톡 공유 메시지에 기사별 제목·요약·대표이미지·기사보기 링크 전달
- 기존 Facebook / X / BAND / Telegram / 시스템 공유 유지

## 카카오 1회 설정 필요
1. Kakao Developers에서 앱 생성
2. App > Platform key > JavaScript key 확인
3. JavaScript SDK domain에 `https://news24.ai.kr` 등록
4. `assets/js/gn24-kakao-config.js`의 `javascriptKey`에 키 입력
5. GitHub에 업로드

## 중요: 직접 URL 붙여넣기 미리보기
현재 Global News24는 GitHub Pages의 정적 `article/index.html?id=...` 구조입니다.
카카오/페이스북 크롤러는 일반적으로 브라우저 JavaScript 실행 후 변경된 OG 태그가 아니라,
서버가 처음 반환한 HTML의 OG 태그를 기준으로 미리보기를 만들 수 있습니다.

따라서 이번 버전의 **카카오톡 버튼 공유**는 기사별 이미지/제목/요약을 정확히 보낼 수 있지만,
주소를 카카오톡 입력창에 직접 붙여넣는 경우까지 기사별 OG를 100% 보장하려면
추후 서버/Edge Function/정적 기사별 공유 페이지 방식이 필요합니다.
