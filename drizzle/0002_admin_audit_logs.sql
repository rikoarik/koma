CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id text PRIMARY KEY,
  action text NOT NULL,
  target text NOT NULL,
  details text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
