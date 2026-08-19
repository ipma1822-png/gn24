# Global News24 v3.2.17 — 좋아요·공감·댓글 실행 오류 수정

## 원인
기사 상세페이지에서 `rel` 변수가 블록 내부에서만 선언된 뒤 바깥에서 다시 사용되어
ReferenceError가 발생했습니다.

이 오류 때문에 기사 본문과 최신뉴스는 일부 표시되었지만,
그 아래의 `setupArticleTools()`와 `setupArticleCommunity()` 실행 전에 JavaScript가 중단되었습니다.

그 결과:
- 좋아요 / 공감 / 응원 / 유익해요 숫자가 0에서 변하지 않음
- 댓글 submit 이벤트가 연결되지 않음
- 댓글 등록 시 URL에 `?nickname=...&content=...`가 붙는 일반 폼 제출이 발생

## 수정
- `rel` 변수를 공통 범위로 이동
- 기사 커뮤니티 초기화 코드가 정상 실행되도록 수정
- 댓글 폼에 `onsubmit="return false;"` 안전장치 추가
- Supabase 설정 JS 캐시 버전을 v3.2.17로 갱신

## 변경 파일
- pages/article/index.html
- assets/js/app.js
- assets/css/style.css (기존 스타일 유지용 포함)

## 테스트
1. GitHub에 같은 위치로 덮어쓰기
2. 기사 상세페이지 Ctrl+F5
3. 좋아요 1회 클릭 → 0이 1로 바뀌는지 확인
4. 댓글 작성 → URL이 바뀌지 않고 "관리자 확인 후 공개됩니다" 메시지 확인
5. Supabase `gn24_article_comments`에서 status=pending 행 확인
