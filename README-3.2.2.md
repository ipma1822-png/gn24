# Global News24 v3.2.2

## 변경 사항
- 관리자 비밀번호 로그인 제거
- Supabase Magic Link(이메일 로그인 링크) 방식 적용
- 등록되지 않은 이메일의 자동 회원가입 방지 (`shouldCreateUser: false`)
- 인증 후 `https://news24.ai.kr/admin-news.html`로 복귀
- 이메일 rate limit 오류 안내 개선
- 기존 기사 편집, 임시저장, 이미지 복원, Supabase DB/Storage 기능 유지

## GitHub 업로드 대상
- `admin-news.html`
- `assets/js/news-cms.js`

기존 파일과 같은 위치에 덮어쓰면 됩니다.
