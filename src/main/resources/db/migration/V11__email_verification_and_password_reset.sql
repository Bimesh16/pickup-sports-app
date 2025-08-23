-- V11: Email verification and password reset support

SET search_path TO public;

-- 1) Verification token table
CREATE TABLE IF NOT EXISTS public.verification_token (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(200) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS ix_verif_username ON public.verification_token (username);

-- 2) Password reset token table
CREATE TABLE IF NOT EXISTS public.password_reset_token (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(200) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL,
  requested_ip VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS ix_prt_username ON public.password_reset_token (username);

-- 3) Verified user table (simple marker with timestamp)
CREATE TABLE IF NOT EXISTS public.verified_user (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  verified_at TIMESTAMPTZ NOT NULL
);
