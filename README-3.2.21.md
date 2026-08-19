# Global News24 v3.2.21 — 기사별 카카오/SNS 정적 OG 자동생성

## 이번 버전의 핵심
카카오톡 링크 미리보기는 브라우저 JavaScript로 나중에 바뀐 OG 태그를 제대로 읽지 못합니다.
그래서 기사마다 아래와 같은 정적 공유주소를 자동 생성합니다.

`https://news24.ai.kr/share/기사ID/`

이 정적 HTML 안에는 처음부터:
- 기사 제목
- 기사 요약
- 1600×900 대표이미지
- 기사 URL
- Global News24 사이트명
이 들어갑니다.

공유페이지를 사람이 클릭하면 실제 기사 상세페이지로 자동 이동합니다.

## GitHub에 올릴 파일
- assets/js/app.js
- assets/js/news-cms.js
- pages/article/index.html
- scripts/generate_share_pages.py
- .github/workflows/build-og-share-pages.yml
- share/ 폴더 전체

## 최초 1회 GitHub Actions 실행
GitHub 저장소 → Actions → `Build GN24 article share pages`
→ `Run workflow`

이후에는 5분마다 Supabase의 공개기사를 확인하여 share 페이지를 자동 갱신합니다.
새 기사 발행 후 최대 약 5분이면 카카오/SNS 공유용 페이지가 생성됩니다.

## 중요
GitHub 저장소 Settings → Actions → General → Workflow permissions에서
`Read and write permissions`가 허용되어 있어야 Actions가 share/ 폴더를 자동 커밋할 수 있습니다.

## 공유 동작
- 카카오/페이스북/X/BAND/Telegram 공유 버튼은 정적 share URL 사용
- 링크복사 버튼도 정적 share URL 사용
- 이미 share 페이지가 생성된 기사는 상세페이지 주소창도 자동으로 `/share/기사ID/` 형태로 바뀜
- 새 기사 직후 share 페이지가 아직 생성되지 않은 동안에는 기존 기사페이지가 그대로 유지됨

## 카카오 JavaScript SDK
카카오톡 전용 버튼 자체를 쓰려면 별도로 JavaScript 키 등록이 필요합니다.
하지만 이번 정적 OG 방식은 URL을 카카오톡에 직접 붙여넣는 미리보기에도 적용됩니다.
