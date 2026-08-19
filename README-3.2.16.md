# Global News24 v3.2.16 — Supabase 기사 반응·댓글 연결

## 변경 파일
- pages/article/index.html
- assets/js/app.js
- assets/css/style.css

## 기사 반응
- 👍 좋아요
- ❤️ 공감
- 👏 응원
- 💡 유익해요
- Supabase `gn24_article_reactions`에 실제 저장
- 모든 방문자가 동일한 반응 수를 확인
- 브라우저별 임의 visitor_id 사용
- 동일 브라우저의 같은 기사/같은 반응 중복 등록 방지
- 현재 버전에서는 반응 취소 기능은 제공하지 않음

## 댓글
- 닉네임 1~30자
- 댓글 2~1,000자
- Supabase `gn24_article_comments`에 `pending`으로 저장
- 일반 기사화면에는 `approved` 댓글만 표시
- 댓글 개수 표시
- 닉네임은 해당 브라우저에 기억

## 중요
- 이번 패치는 기사 공개화면 연결 단계입니다.
- 댓글 승인/숨김/삭제는 다음 버전에서 관리자 편집실에 추가합니다.
- 기존 기사 DB / 이미지 Storage / 기사 관리자 저장·발행 기능은 변경하지 않습니다.
