# GLOBAL NEWS24 AI NEWSROOM — PHASE 2-3
Version: v3.6.2

## Completed
- Added `/pages/admin-reporter-applications/` HQ reporter application review page.
- Added authenticated administrator magic-link login.
- Reads `gn24_reporter_applications` under existing RLS.
- Filters pending/reviewing/approved/rejected applications.
- Administrator can set reviewing/approved/rejected and save review notes.
- Existing database RLS remains the authority: editors may read; only GN24 admins may update/delete applications.
- Approval does not yet create a reporter record. That conversion is intentionally reserved for PHASE 2-4 to keep approval and identity-number creation atomic and auditable.

## Safety
- No service-role/secret key is exposed in browser code.
- Existing public reporter application form and current articles/reporters are unchanged.
- Application list is unavailable until a valid authenticated GN24 administrator session passes `is_gn24_admin()`.

## Next
PHASE 2-4: reporter number and profile creation from approved application.