# Global News24 AI NEWSROOM v3.12.10

## 핵심 수정

휴대폰 기자센터에서는 카카오 인증이 정상(`active`)이었지만, 간편취재/음성취재에서 저장이 `기자 권한 확인 중 저장이 차단되었습니다`로 실패하는 원인을 생산 Supabase에서 확인했습니다.

`gn24_reporter_submissions`에는 기자용 RLS 정책이 존재했지만 `authenticated` 역할에 `SELECT / INSERT / UPDATE` 테이블 권한이 빠져 있었습니다. 이 때문에 정상 기자 요청도 RLS 평가 전에 권한 단계에서 차단될 수 있었습니다.

생산 DB에 다음을 적용했습니다.

- authenticated: SELECT / INSERT / UPDATE 허용
- authenticated: DELETE / TRUNCATE / REFERENCES / TRIGGER 제거
- anon: 해당 DML 및 관리 권한 제거
- 기존 기자별 RLS 정책은 그대로 유지

또한 기자 손안의 마법사도 공통 `gn24-reporter-auth.js` 인증 모듈을 사용하도록 통일했고, 기자센터/손안의 마법사/간편취재/음성취재의 표시 버전을 `v3.12.10`으로 맞췄습니다.

## 운영 원칙

익명 사용자는 취재 제출 테이블에 접근하지 않습니다. 인증 기자는 자신의 행만 RLS 정책 범위에서 생성·조회·수정할 수 있습니다. 최종 발행 권한은 기존 관리자 승인 흐름을 그대로 유지합니다.

## 현장 재시험

모바일에서 `v3.12.10` 표시 확인 후 간편취재 또는 음성취재에서 사진을 선택하고 본사 전송을 재시험합니다. 성공 시 접수 ID가 표시되고 생산 `gn24_reporter_submissions`에 행이 생성되어야 합니다.
