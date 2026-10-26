CREATE TABLE IF NOT EXISTS admin_messages (
  id text PRIMARY KEY,
  session_id text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages (created_at DESC);
