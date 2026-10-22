DO $$
DECLARE
  inserted_count INTEGER;
  column_count INTEGER;
BEGIN
  IF NOT has_table_privilege('anon', 'public.ls_standings', 'SELECT')
     OR has_table_privilege('anon', 'public.ls_standings', 'INSERT')
     OR has_table_privilege('anon', 'public.ls_standings', 'UPDATE')
     OR has_table_privilege('anon', 'public.ls_standings', 'DELETE') THEN
    RAISE EXCEPTION 'anon football cache privileges are not read-only';
  END IF;

  IF has_function_privilege('anon', 'public.replace_ls_standings(integer,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.acquire_ls_sync_lock(text,integer)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.replace_ls_standings(integer,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'administrative RPC privileges are incorrect';
  END IF;

  SELECT count(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'matches'
    AND column_name IN ('home_team_id', 'away_team_id')
    AND data_type = 'text';

  IF column_count <> 2 THEN
    RAISE EXCEPTION 'matches team identifiers must be text';
  END IF;

  SELECT count(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'ls_fixtures'
    AND column_name = 'time_status'
    AND is_nullable = 'NO'
    AND column_default = '''confirmed''::text';

  IF column_count <> 1 THEN
    RAISE EXCEPTION 'ls_fixtures.time_status must be non-null with confirmed default';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ls_fixtures_time_status_check'
  ) THEN
    RAISE EXCEPTION 'ls_fixtures.time_status check constraint is missing';
  END IF;

  IF NOT public.acquire_ls_sync_lock('integration-owner-a', 60) THEN
    RAISE EXCEPTION 'first lock acquisition failed';
  END IF;

  IF public.acquire_ls_sync_lock('integration-owner-b', 60) THEN
    RAISE EXCEPTION 'competing lock acquisition unexpectedly succeeded';
  END IF;

  IF NOT public.release_ls_sync_lock('integration-owner-a') THEN
    RAISE EXCEPTION 'lock release failed';
  END IF;

  SELECT public.replace_ls_standings(
    -999,
    '[
      {
        "competition_id": -999,
        "rank": 1,
        "team_id": "fixture-a",
        "team_name": "Fixture A",
        "points": 3,
        "played": 1,
        "won": 1,
        "drawn": 0,
        "lost": 0,
        "goals_for": 1,
        "goals_against": 0,
        "goal_diff": 1,
        "zone": null
      },
      {
        "competition_id": -999,
        "rank": 2,
        "team_id": "fixture-b",
        "team_name": "Fixture B",
        "points": 0,
        "played": 1,
        "won": 0,
        "drawn": 0,
        "lost": 1,
        "goals_for": 0,
        "goals_against": 1,
        "goal_diff": -1,
        "zone": null
      }
    ]'::jsonb
  ) INTO inserted_count;

  IF inserted_count <> 2
     OR (SELECT count(*) FROM public.ls_standings WHERE competition_id = -999) <> 2 THEN
    RAISE EXCEPTION 'atomic standings replacement failed';
  END IF;

  DELETE FROM public.ls_standings WHERE competition_id = -999;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.release_ls_sync_lock('integration-owner-a');
    DELETE FROM public.ls_standings WHERE competition_id = -999;
    RAISE;
END;
$$;
