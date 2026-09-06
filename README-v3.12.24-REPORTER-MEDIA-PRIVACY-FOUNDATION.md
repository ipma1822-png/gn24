# GLOBAL NEWS24 AI NEWSROOM v3.12.24

## Reporter Media Privacy Foundation

PHASE 8-5 정식 운영 준비를 위한 취재사진 보호 기반 단계입니다.

### 이번 단계
- `gn24_reporter_submissions.media_paths` 추가
- 기존 `reporter-media` 공개 URL에서 Storage object path 자동 추출·보관
- 향후 모든 `media_urls` 변경 때 `media_paths`를 자동 동기화하는 DB trigger 추가
- 인증된 사용자 중 관리자, 편집자, 해당 기자만 `reporter-media` 객체를 읽을 수 있는 인증용 SELECT policy 추가
- 기존 공개 읽기 정책은 이번 단계에서 즉시 제거하지 않음

### 왜 2단계로 진행하는가
현재 기사 발행 RPC와 기존 화면은 공개 `media_urls`를 직접 사용하고 있습니다. 이 상태에서 버킷을 즉시 private으로 바꾸면 기존 기사·편집화면 이미지가 깨질 수 있습니다. v3.12.24는 URL과 Storage path를 병행 보존하여 다음 단계에서 signed URL(서명 URL) 전환과 발행용 이미지 분리를 안전하게 진행할 수 있게 합니다.

### 다음 단계
- 편집/기자 화면은 인증된 signed URL로 raw 취재사진을 표시
- 공개 발행 시 공개 기사 이미지와 raw 취재증거 이미지를 분리
- 그 후 `reporter-media`의 public read policy 제거 및 bucket private 전환

### 비용 원칙
추가 유료 AI/API 없이 기존 Supabase 구조 안에서 진행합니다.
