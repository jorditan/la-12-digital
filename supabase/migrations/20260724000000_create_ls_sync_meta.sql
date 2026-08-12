-- Tracks football data sync jobs from scrapper-promiedos (shared Supabase)
CREATE TABLE IF NOT EXISTS ls_sync_meta (
  id TEXT PRIMARY KEY DEFAULT 'default',
  last_success_at TIMESTAMPTZ NULL,
  last_attempt_at TIMESTAMPTZ NULL,
  last_error TEXT NULL,
  last_source TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ls_sync_meta (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE ls_sync_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ls_sync_meta_public_read" ON ls_sync_meta;
CREATE POLICY "ls_sync_meta_public_read"
  ON ls_sync_meta
  FOR SELECT
  TO anon, authenticated
  USING (true);
