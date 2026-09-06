# GLOBAL NEWS24 LIVE NEWSROOM SHOWROOM v1.0

## 목적
기존 GLOBAL NEWS24 AI NEWSROOM 운영 시스템을 변경하지 않고, 모바일 방문자가 15초 안에 `말하기 → 사진 → 본사 전송 → 기사 편집 → 사람의 최종 승인 → 발행` 흐름을 이해하도록 하는 독립 홍보·체험 모듈이다.

## 공개 경로
- `/pages/live-newsroom-showroom/`
- 기자 지원 CTA: 기존 `/pages/reporter-apply/` 재사용

## 보호 원칙
- Supabase 연결 없음
- `gn24_reporter_submissions` 접근 없음
- 기사 DB 접근 없음
- 최종 발행 RPC 호출 없음
- 관리자 권한 호출 없음
- 기존 기자센터·카카오 로그인·편집데스크·최종관리자 코드 수정 없음

## 구현
- HTML/CSS/JavaScript 단일 독립 모듈
- 기존 `assets/images/logos/gn24-icon.svg` 재사용
- 15초 7 SCENE 타임라인
- 15초 후 CTA 상태 유지 및 다시 보기
- 기본 음소거, 사용자 선택 시 Web Audio 기반 짧은 로컬 효과음
- 30초 기자 체험: Web Speech API 지원 시 음성 입력, 미지원 시 텍스트 입력
- 사진은 `URL.createObjectURL()` 로컬 미리보기만 사용하며 업로드하지 않음
- 기사 생성은 프론트엔드 템플릿 DEMO이며 외부 AI API 호출 없음
- `prefers-reduced-motion` 대응
- 360~430px 모바일 우선, 데스크톱 중앙 배치

## 분석 이벤트 준비
SHOWROOM은 서버 저장 없이 브라우저 `CustomEvent('gn24:showroom')`를 발생시킨다. `window.dataLayer`가 이미 존재하는 환경에서는 같은 이벤트를 선택적으로 전달할 수 있다.

이벤트:
- `showroom_view`
- `intro_complete`
- `demo_start`
- `demo_complete`
- `reporter_apply_click`

체험 음성·텍스트·사진 내용 자체는 분석 이벤트에 포함하지 않는다.

## 버전 구분
- SHOWROOM: `v1.0`
- 기존 AI NEWSROOM 운영 버전과 별도 관리

## PHASE 상태
- PHASE A LIVE INTRO 프로토타입: 완료
- PHASE B 15초 전체 애니메이션: 완료
- PHASE C 30초 기자 체험: 완료
- PHASE D 기존 기자지원 연결: 완료
- PHASE E 손안의 마법사 연결: 연결 가능한 독립 URL 준비 완료, 손안의 마법사 저장소 자체는 이번 커밋에서 수정하지 않음
- PHASE F 모바일 최적화·회귀 보호: 독립 모듈 구조 및 reduced-motion 적용 완료. 실제 기기 최종 시각 검수는 배포 URL 기준으로 진행 가능
