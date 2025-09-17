# S3 Setup Guide

This app supports storing media on S3-compatible storage with two URL strategies:

1) Public base URL (recommended with CDN)
- Configure objects to be publicly readable (or behind a CDN that has access).
- Set `app.media.s3.public-base-url` to your CDN/domain (e.g., `https://cdn.example.com`).
- Objects will be addressed as `<public-base-url>/<prefix>/<relativePath>`.

2) Presigned URLs
- If you cannot expose objects publicly, enable presigned URLs:
  - `app.media.s3.presign.enabled: true`
  - `app.media.s3.presign.ttlSeconds: 900` (15 minutes default)
- The app will return presigned GET URLs for media.

## Required properties
