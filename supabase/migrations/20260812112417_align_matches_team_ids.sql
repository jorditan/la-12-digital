-- Promiedos team identifiers can be alphanumeric; keep snapshots compatible with ls_fixtures.
ALTER TABLE public.matches
  ALTER COLUMN home_team_id TYPE TEXT USING home_team_id::TEXT,
  ALTER COLUMN away_team_id TYPE TEXT USING away_team_id::TEXT;
