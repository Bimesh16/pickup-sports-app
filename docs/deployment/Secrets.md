# Secrets Management

## Recommended approaches

- Environment variables (12-factor): set secrets in the environment (no commits).
- Secret managers: HashiCorp Vault, AWS Secrets Manager, or GCP Secret Manager.
- K8s: use Secrets and mount as env or files; restrict RBAC.

## Sensitive keys

- JWT secret: `security.jwt.secret`
- Mail credentials: `spring.mail.username`, `spring.mail.password`
- S3 credentials: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (DefaultCredentialsProvider)
- Redis (if secured): `spring.data.redis.password`

## Tips

- Never commit secrets to VCS.
- Rotate regularly; use short TTLs for creds where possible.
- For local dev, use a `.env.local` (ignored by VCS) and a loader or IDE run config.
