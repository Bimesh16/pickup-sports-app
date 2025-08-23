-- V12: Email change token table for change-email flow

SET search_path TO public;

CREATE TABLE IF NOT EXISTS public.email_change_token (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(200) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL,
  requested_ip VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS ix_email_change_username ON public.email_change_token (username);
