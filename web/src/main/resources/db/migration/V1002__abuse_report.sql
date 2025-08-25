CREATE TABLE IF NOT EXISTS abuse_report (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES app_user(id),
    subject_type VARCHAR(16) NOT NULL,
    subject_id BIGINT NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ NULL,
    resolver VARCHAR(255) NULL
);

CREATE INDEX IF NOT EXISTS idx_abuse_report_status ON abuse_report(status);
CREATE INDEX IF NOT EXISTS idx_abuse_report_created_at ON abuse_report(created_at);
