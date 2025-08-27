INSERT INTO app_user (id, username, password)
VALUES
  (100, 'jane@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOqNhBM9D/uh8.e8ZFw8n.4oMaX41Z1XO'),
  (101, 'john@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOqNhBM9D/uh8.e8ZFw8n.4oMaX41Z1XO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_user_roles (user_id, role)
VALUES
  (100, 'USER'),
  (101, 'USER')
ON CONFLICT DO NOTHING;
