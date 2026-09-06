# GLOBAL NEWS24 v3.13.3 — 기자 공식 신분정보 통합

## 목적
기자 공개 프로필, 기자센터, 모바일 기자증, 기자 손안의 마법사에서 같은 공식 신분정보를 표시한다.

## 통합 표시 필드
- reporter_rank: 기자 / 선임기자 / 수석기자
- reporter_type: 일반기자 / 지역기자 / 전문기자 / 객원기자 / 해외통신원 / 참여형 기자
- organization_position: 편집국장 / 취재부장 / 시·도본부장 / 지부장 등
- regional_hq_code: 17개 시·도본부 또는 본사 직할
- special_designations: 특임기자 / 논설위원 / 전문위원 등
- reporter_number: 본사 통합 기자번호

## 반영 파일
- assets/js/reporter-card.js
- assets/js/reporter-center.js
- assets/js/reporter-wizard.js
- assets/js/reporters.js

## 원칙
- 시스템 권한(access_level)은 기자 직급/조직 직책과 분리한다.
- 본부장/수석기자라고 해서 admin/editor 권한이 자동 부여되지 않는다.
- 기존 로그인, 카카오 인증, 기사 작성, 기자번호 구조는 변경하지 않는다.
- 공개 프로필은 gn24_public_reporters()의 공개 필드만 사용한다.

Version: v3.13.3
