# Privacy & Data Retention

This project provides export and deletion tools so users can control their data.

## Data Export

1. Call `POST /users/me/export` to request a data export. The response includes a confirmation token.
2. Retrieve your data with `GET /users/me/export/{token}`. The token expires after one use.

## Account Deletion

1. Call `POST /users/me/delete` to request deletion. A token is returned.
2. Finalize removal with `DELETE /users/me/delete/{token}`. This action permanently removes the account and associated data.

## Retention Schedule

Old records are periodically purged by a scheduled Spring Batch job.

| Data Type          | Retention | Notes |
|--------------------|-----------|-------|
| Chat messages      | 60 days   | Stored in `chat_messages`; removed when older than retention.
| Admin audit trails | 365 days  | Stored in `admin_audit` table.

The batch job runs nightly by default and can be configured with `retention.batch.cron`.

## Privacy Processes

- Export and deletion flows require confirmation tokens to prevent accidental actions.
- Retention periods are configurable via properties such as `retention.chat.messages.days` and `retention.audit.days`.
- Purged data is permanently removed and cannot be restored.
