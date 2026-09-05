# GLOBAL NEWS24 AI NEWSROOM — PHASE 4-5
Version: v3.8.4

## Completed
- Added `original_submission jsonb` and `original_captured_at` to `gn24_reporter_submissions`.
- When a report is first submitted, the database captures an immutable snapshot of the reporter-provided source fields before AI/editorial transformations.
- Direct `submitted` inserts are captured as well as draft -> submitted transitions.
- Once captured, a BEFORE UPDATE trigger restores the stored original snapshot on every later update, so subsequent reporter clarification, AI drafting, editor review, or workflow updates cannot overwrite the first-submitted source snapshot.
- AI output remains in the separate `ai_*` fields. Original source and AI draft are therefore independently auditable.

## Snapshot fields
`occurred_at`, `location`, `people`, `facts`, `reporter_notes`, `source_notes`, `contact_for_verification`, `media_urls`, and initial `submitted_at`.

## Compatibility
No existing source fields or rows were deleted or rewritten. Existing historical rows remain valid; the immutable snapshot begins when a submission first enters `submitted` after this upgrade. No publication permission was changed.

## Editorial purpose
PHASE 5 can present `original_submission` beside the AI draft so headquarters can see exactly what the reporter originally sent and what AI produced or changed.

## Next
PHASE 5-1 — AI editorial desk/dashboard.