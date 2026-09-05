# GLOBAL NEWS24 AI NEWSROOM — PHASE 4-3
Version: v3.8.2

## Completed
- Added clarification question/response fields to `gn24_reporter_submissions`.
- Reused the established `revision_requested` workflow instead of creating a conflicting status.
- Reporter status page now shows AI/HQ missing-fact questions when a report is in `revision_requested`.
- Reporter can answer directly on mobile and resubmit the same submission.
- Reporter is explicitly told not to guess: unknown facts can be answered as not confirmed.
- Resubmission returns the record to `submitted`, ready for re-analysis/redrafting.

## Security
Existing RLS remains the enforcement layer. A reporter may update only their own row when its current status is `draft` or `revision_requested`, and the new state may only be `draft` or `submitted`. The reporter cannot set AI, editor, approval, publication, or rejection states.

## AI integration note
PHASE 4-2 already returns `missing_facts`. PHASE 4-3 now provides the data model and reporter UI needed for those missing facts to become explicit clarification questions rather than hallucinated content. The later editorial workflow can set `clarification_questions` and `revision_requested` automatically or manually.

## Next
PHASE 4-4 — story-type-specific writing styles.