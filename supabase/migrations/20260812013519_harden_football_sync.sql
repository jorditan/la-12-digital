-- Make the football cache reproducible, observable and safe for direct public reads.

CREATE TABLE IF NOT EXISTS public.ls_standings (
  id SERIAL PRIMARY KEY,
  competition_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  points INTEGER NOT NULL,
  played INTEGER NOT NULL,
  won INTEGER NOT NULL,
  drawn INTEGER NOT NULL,
  lost INTEGER NOT NULL,
  goals_for INTEGER NOT NULL,
  goals_against INTEGER NOT NULL,
  goal_diff INTEGER NOT NULL,
  zone VARCHAR(100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_standings_comp_team_zone
  ON public.ls_standings (competition_id, team_id, COALESCE(zone, ''));

CREATE TABLE IF NOT EXISTS public.ls_fixtures (
  id VARCHAR(50) PRIMARY KEY,
  competition_id INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  home_team_id VARCHAR(50) NOT NULL,
  away_team_id VARCHAR(50) NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status VARCHAR(50) NOT NULL,
  venue VARCHAR(150),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixtures_home_date
  ON public.ls_fixtures (home_team_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_date
  ON public.ls_fixtures (away_team_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fixtures_comp_status_date
  ON public.ls_fixtures (competition_id, status, date);

CREATE TABLE IF NOT EXISTS public.ls_h2h (
  rival_id VARCHAR(50) PRIMARY KEY,
  stats JSONB NOT NULL,
  last_matches JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ls_squad (
  id SERIAL PRIMARY KEY,
  team_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sname VARCHAR(100),
  num VARCHAR(10),
  position VARCHAR(50) NOT NULL,
  formation_position VARCHAR(50),
  age INTEGER,
  height VARCHAR(20),
  weight VARCHAR(20),
  country_id VARCHAR(10),
  birthdate VARCHAR(20),
  is_staff BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_squad_team_name
  ON public.ls_squad (team_id, name);

CREATE TABLE IF NOT EXISTS public.ls_sync_dataset_meta (
  dataset TEXT PRIMARY KEY,
  last_success_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  last_source TEXT,
  last_duration_ms INTEGER,
  last_record_count INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ls_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ls_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ls_h2h ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ls_squad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ls_sync_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ls_sync_dataset_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de posiciones" ON public.ls_standings;
DROP POLICY IF EXISTS "Permitir lectura publica de fixtures" ON public.ls_fixtures;
DROP POLICY IF EXISTS "Permitir lectura publica de H2H" ON public.ls_h2h;
DROP POLICY IF EXISTS "Permitir lectura publica de plantel" ON public.ls_squad;
DROP POLICY IF EXISTS "ls_sync_meta_public_read" ON public.ls_sync_meta;

CREATE POLICY "ls_standings_public_read" ON public.ls_standings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ls_fixtures_public_read" ON public.ls_fixtures
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ls_h2h_public_read" ON public.ls_h2h
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ls_squad_public_read" ON public.ls_squad
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ls_sync_meta_public_read" ON public.ls_sync_meta
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ls_sync_dataset_meta_public_read" ON public.ls_sync_dataset_meta
  FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON public.ls_standings, public.ls_fixtures, public.ls_h2h,
  public.ls_squad, public.ls_sync_meta, public.ls_sync_dataset_meta
  FROM anon, authenticated;
GRANT SELECT ON public.ls_standings, public.ls_fixtures, public.ls_h2h,
  public.ls_squad, public.ls_sync_meta, public.ls_sync_dataset_meta
  TO anon, authenticated;
GRANT ALL ON public.ls_standings, public.ls_fixtures, public.ls_h2h,
  public.ls_squad, public.ls_sync_meta, public.ls_sync_dataset_meta
  TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ls_standings_id_seq,
  public.ls_squad_id_seq TO service_role;

-- Keep updated_at meaningful when an upsert updates an existing row.
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;

DROP TRIGGER IF EXISTS trg_ls_standings_updated_at ON public.ls_standings;
CREATE TRIGGER trg_ls_standings_updated_at
  BEFORE UPDATE ON public.ls_standings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_ls_fixtures_updated_at ON public.ls_fixtures;
CREATE TRIGGER trg_ls_fixtures_updated_at
  BEFORE UPDATE ON public.ls_fixtures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_ls_h2h_updated_at ON public.ls_h2h;
CREATE TRIGGER trg_ls_h2h_updated_at
  BEFORE UPDATE ON public.ls_h2h
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_ls_squad_updated_at ON public.ls_squad;
CREATE TRIGGER trg_ls_squad_updated_at
  BEFORE UPDATE ON public.ls_squad
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Atomic standings replacement. A failed insert rolls the delete back.
CREATE OR REPLACE FUNCTION public.replace_ls_standings(
  p_competition_id INTEGER,
  p_rows JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  inserted_count INTEGER;
BEGIN
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows) < 2 THEN
    RAISE EXCEPTION 'standings payload must contain at least two rows';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_rows) AS row_data(competition_id INTEGER)
    WHERE row_data.competition_id IS DISTINCT FROM p_competition_id
  ) THEN
    RAISE EXCEPTION 'standings payload contains a mismatched competition_id';
  END IF;

  DELETE FROM public.ls_standings
  WHERE competition_id = p_competition_id;

  INSERT INTO public.ls_standings (
    competition_id, rank, team_id, team_name, points, played, won, drawn,
    lost, goals_for, goals_against, goal_diff, zone
  )
  SELECT
    competition_id, rank, team_id, team_name, points, played, won, drawn,
    lost, goals_for, goals_against, goal_diff, zone
  FROM jsonb_to_recordset(p_rows) AS row_data(
    competition_id INTEGER,
    rank INTEGER,
    team_id VARCHAR(50),
    team_name VARCHAR(100),
    points INTEGER,
    played INTEGER,
    won INTEGER,
    drawn INTEGER,
    lost INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_diff INTEGER,
    zone VARCHAR(100)
  );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_ls_standings(INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_ls_standings(INTEGER, JSONB) TO service_role;

-- Cross-process lock used by Render and GitHub Actions.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.ls_sync_lock (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
REVOKE ALL ON private.ls_sync_lock FROM PUBLIC, anon, authenticated;
GRANT ALL ON private.ls_sync_lock TO service_role;

CREATE OR REPLACE FUNCTION public.acquire_ls_sync_lock(
  p_owner TEXT,
  p_ttl_seconds INTEGER DEFAULT 1800
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
  IF p_owner IS NULL OR btrim(p_owner) = '' THEN
    RAISE EXCEPTION 'lock owner is required';
  END IF;

  INSERT INTO private.ls_sync_lock (id, owner, acquired_at, expires_at)
  VALUES ('football-sync', p_owner, now(), now() + make_interval(secs => p_ttl_seconds))
  ON CONFLICT (id) DO UPDATE
    SET owner = EXCLUDED.owner,
        acquired_at = EXCLUDED.acquired_at,
        expires_at = EXCLUDED.expires_at
    WHERE private.ls_sync_lock.expires_at <= now()
       OR private.ls_sync_lock.owner = EXCLUDED.owner;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_ls_sync_lock(p_owner TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
  DELETE FROM private.ls_sync_lock
  WHERE id = 'football-sync' AND owner = p_owner;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.acquire_ls_sync_lock(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_ls_sync_lock(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_ls_sync_lock(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_ls_sync_lock(TEXT) TO service_role;

-- Apply the profile hardening that exists in the repository but drifted from production.
CREATE OR REPLACE FUNCTION public.is_username_available(candidate_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  normalized TEXT := btrim(candidate_username);
BEGIN
  IF normalized IS NULL
     OR char_length(normalized) < 2
     OR char_length(normalized) > 32
     OR normalized !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = normalized
  );
END;
$$;
REVOKE ALL ON FUNCTION public.is_username_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Apply the pending avatar content restrictions as part of the same hardening.
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::TEXT = (storage.foldername(name))[1]
    AND lower(COALESCE(storage.extension(name), '')) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    AND COALESCE((metadata->>'size')::INTEGER, 0) <= 2097152
  );
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::TEXT = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::TEXT = (storage.foldername(name))[1]
    AND lower(COALESCE(storage.extension(name), '')) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    AND COALESCE((metadata->>'size')::INTEGER, 0) <= 2097152
  );
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::TEXT = (storage.foldername(name))[1]
  );

-- Attendance policies use explicit roles and init-plan-friendly auth checks.
DROP POLICY IF EXISTS "Users can read own attendance" ON public.match_attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON public.match_attendance;
DROP POLICY IF EXISTS "Users can update own attendance" ON public.match_attendance;
DROP POLICY IF EXISTS "Users can delete own attendance" ON public.match_attendance;
CREATE POLICY "Users can read own attendance" ON public.match_attendance
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own attendance" ON public.match_attendance
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own attendance" ON public.match_attendance
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own attendance" ON public.match_attendance
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON public.match_attendance FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_attendance TO authenticated;

-- Match snapshots are immutable from the browser after insertion.
DROP POLICY IF EXISTS "Authenticated users can upsert matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;
CREATE POLICY "Authenticated users can insert match snapshots" ON public.matches
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
REVOKE ALL ON public.matches FROM anon, authenticated;
GRANT SELECT ON public.matches TO anon, authenticated;
GRANT INSERT ON public.matches TO authenticated;
