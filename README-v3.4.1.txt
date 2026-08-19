Global News24 v3.4.1 · 카카오톡 직접공유 부분 업데이트

GitHub 저장소 루트에 이 ZIP의 폴더 구조 그대로 덮어쓰기 하세요.

교체 파일
1) assets/js/gn24-kakao-config.js
2) pages/article/index.html

기존 app.js의 Kakao.Share.sendDefault 기능을 그대로 사용합니다.
카카오 개발자 콘솔에서 아래 두 설정이 완료되어 있어야 합니다.
- JavaScript SDK 도메인: https://news24.ai.kr
- 제품 링크 관리 웹 도메인: https://news24.ai.kr

업로드 후 기사 페이지에서 Ctrl+F5 후 노란 '카카오톡' 버튼을 테스트하세요.
