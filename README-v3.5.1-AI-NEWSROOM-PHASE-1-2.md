# Global News24 v3.5.1 · AI NEWSROOM PHASE 1-2

PHASE 1-2는 기존 `gn24_articles`의 공개 여부와 `workflow_status`를 일관되게 정비하는 단계입니다.

## 적용 내용

- 기사 Workflow(워크플로) 상태를 다음 6개로 제한합니다.
  - `draft`
  - `editor_review`
  - `approved`
  - `published`
  - `rejected`
  - `archived`
- `workflow_status` 기본값을 `draft`로 변경합니다.
- 공개 기사(`is_published=true`)는 자동으로 `published` 상태가 됩니다.
- 기존 관리자 전용 비공개 기사 중 `published`로 남아 있던 항목은 `draft`로 정리합니다.
- 기사 공개 여부가 변경되면 Workflow 상태도 자동으로 동기화됩니다.
- 기존 기사 본문·이미지·기자·댓글·반응·조회수 데이터는 삭제하거나 재작성하지 않습니다.

## 현재 결과

적용 직후 기존 기사 58건 기준:

- 공개 기사 56건 → `published`
- 관리자 전용 비공개 기사 2건 → `draft`

PHASE 1-1의 `gn24_reporter_submissions`와 PHASE 1-2의 기사 Workflow가 분리되어 있으므로, 향후 기자 취재접수 → AI 초안 → 편집검토 → 승인 → 기사발행 파이프라인을 안전하게 연결할 수 있습니다.
