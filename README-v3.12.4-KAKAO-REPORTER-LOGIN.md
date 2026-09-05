# GLOBAL NEWS24 — Kakao-first Reporter Login
Version: v3.12.4
Date: 2026-09-06

## Change
Reporter Center now uses Kakao OAuth as the primary login method.

## Flow
1. Reporter taps `카카오로 로그인`.
2. Browser opens Supabase Auth `/auth/v1/authorize?provider=kakao`.
3. Kakao authenticates the user and returns through the GLOBAL-NEWS24 Supabase callback URL.
4. Supabase returns a reporter session to `/pages/reporter-center/`.
5. Existing `gn24_my_reporter_id()` and `gn24_my_access_level()` functions match the authenticated JWT email against `gn24_reporters.login_email` for an active reporter.
6. Only an active registered reporter is allowed into Reporter Center.

## Safety
- Existing email magic-link login remains available under a collapsed emergency section.
- Emergency email OTP uses `create_user:false` so it does not create new Auth users.
- Existing reporter authorization, RLS, newsroom workflow, and publication permissions are unchanged.
- Kakao Client Secret is never stored in GitHub/browser code.

## Production requirement
Kakao provider must be enabled in Supabase GLOBAL-NEWS24 with the Kakao REST API Key and Client Secret, and the Kakao Developers login redirect URI must include:
`https://plqqowwdbgixtczzyanr.supabase.co/auth/v1/callback`

## Verification
The final proof is a real mobile Kakao login using an approved reporter whose Kakao account email matches the reporter `login_email`.