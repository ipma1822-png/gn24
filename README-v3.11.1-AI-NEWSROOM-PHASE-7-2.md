# GLOBAL NEWS24 AI NEWSROOM — PHASE 7-2
Version: v3.11.1

## 완료
- 기자 간편취재 화면에 휴대폰 사진 직접 첨부 추가
- 카메라 촬영 또는 갤러리 선택 지원
- 최대 8장 선택, 사진 1장당 최대 10MB
- JPEG/PNG/WEBP/GIF 허용
- 전용 Supabase Storage bucket `reporter-media` 생성
- 기자는 자기 reporter_id 폴더 아래에만 업로드 가능
- 본사 관리자는 reporter-media 전체 관리 가능
- 업로드 사진 URL을 `gn24_reporter_submissions.media_urls`에 자동 연결
- 기존 URL 첨부 방식도 함께 유지
- 기자 손안의 마법사에서 `사진 찍고 바로 보내기` 진입 연결

## 저장 흐름
1. 취재자료를 draft 상태로 먼저 생성해 submission id를 확보한다.
2. 사진을 `reporter-media/{reporter_id}/{submission_id}/...` 경로로 업로드한다.
3. 업로드된 공개 URL과 기존 URL 입력값을 media_urls에 합친다.
4. 최종적으로 draft 또는 submitted 상태로 PATCH한다.

이 순서는 사진 업로드 중 오류가 발생해도 이미 생성된 취재자료가 draft로 남아 복구 가능하도록 하기 위한 방식이다.

## 보안
- 브라우저에는 publishable key와 기자 사용자 JWT만 사용한다.
- service_role key는 사용하지 않는다.
- Storage RLS에서 `storage.foldername(name)[1] = gn24_my_reporter_id()` 조건으로 다른 기자 폴더 업로드를 막는다.
- reporter-media는 기사/편집 화면에서 바로 사용할 수 있도록 public read로 운영한다.

## 회귀 보호
- 기존 `news-images` bucket과 CMS 업로드 정책은 변경하지 않았다.
- 기존 기자 간편취재 URL 첨부 기능 유지
- 기존 submission RLS 및 workflow 상태 규칙 유지
- 테스트용 취재자료/이미지는 생성하지 않았다.

## 다음
PHASE 7-3 — 음성취재와 사진첨부를 한 화면에서 결합하여 `말하고 → 사진 찍고 → 본사 전송` 흐름 완성.