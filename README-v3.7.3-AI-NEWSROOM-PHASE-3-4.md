# GLOBAL NEWS24 AI NEWSROOM — PHASE 3-4
Version: v3.7.3

## Completed
- Added `/pages/reporter-voice/` mobile voice-reporting page.
- Reporter authentication is required and verified through `gn24_my_reporter_id()`.
- Uses browser SpeechRecognition / webkitSpeechRecognition when available, Korean (`ko-KR`).
- Supports continuous/interim speech-to-text with manual correction before submission.
- Voice transcript is stored in `gn24_reporter_submissions.facts` and marked in reporter notes as voice input.
- Optional location, people/organizations, and source notes are included.
- Supports both `draft` and `submitted` creation under the existing reporter-owned RLS.
- Activated Voice Report in Reporter Center.

## Editorial / safety rules
- Voice recognition is transcription only; it does not invent facts or automatically write/publish an article.
- The reporter is explicitly asked to review misrecognitions before sending.
- AI fact extraction and article drafting remain PHASE 4.
- Final publication remains administrator approval only.
- Unsupported browsers fall back to manual text entry rather than blocking the reporting page.

## Next
PHASE 3-5: My submissions and article-status tracking.