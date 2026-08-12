ALTER TABLE public.ls_fixtures
  ADD COLUMN IF NOT EXISTS time_status text NOT NULL DEFAULT 'confirmed';

ALTER TABLE public.ls_fixtures
  DROP CONSTRAINT IF EXISTS ls_fixtures_time_status_check;

ALTER TABLE public.ls_fixtures
  ADD CONSTRAINT ls_fixtures_time_status_check
  CHECK (time_status IN ('pending', 'confirmed'));

COMMENT ON COLUMN public.ls_fixtures.time_status IS
  'Whether the kickoff time is provisional or confirmed by the source.';

-- Promiedos uses 14:00 Argentina as the provisional slot for Boca league
-- fixtures. Existing records are backfilled explicitly; later syncs own the
-- pending -> confirmed transition when the source publishes a real time.
UPDATE public.ls_fixtures
SET time_status = 'pending'
WHERE status = 'scheduled'
  AND competition_id = 23
  AND (home_team_id = '934' OR away_team_id = '934'
       OR home_team ILIKE '%Boca%' OR away_team ILIKE '%Boca%')
  AND (date AT TIME ZONE 'America/Argentina/Buenos_Aires')::time = TIME '14:00';
