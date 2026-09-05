# Global News24 v3.5.2 · AI NEWSROOM PHASE 1-3

기자·편집국·관리자 권한 체계를 실제 운영 기준으로 정비했습니다.

## 권한 원칙
- admin: 기자 임명/정지/권한변경, 전체 취재접수 관리, 최종 기사 공개 발행
- editor: 전체 취재접수 열람 및 편집 검토, 비공개 기사 수정 가능, 공개 발행 불가
- reporter: 본인 취재접수 작성/조회 및 본인 비공개 기사 작성·수정
- contributor: reporter와 동일한 안전 범위에서 초안 제출, 최종 발행은 본사 승인

## 주요 변경
- gn24_reporters.access_level 허용값을 editor/reporter/contributor로 제한
- 중복 RLS 정책 정리
- 기자 임명 및 상태 변경은 admin만 가능하도록 고정
- 기사 공개 발행은 admin만 가능하도록 제한
- editor는 전체 비공개 기사 및 취재접수 검토 가능하나 공개 발행 불가
- reporter/contributor는 자기 자료만 작성·수정 가능
- 기자 권한 확인용 SECURITY DEFINER helper 함수는 anon 실행 차단

## 보존 원칙
기존 공개기사, 관리자 CMS, 기자소개, 댓글, 반응, 조회수, 공유 기능은 변경하지 않습니다.
