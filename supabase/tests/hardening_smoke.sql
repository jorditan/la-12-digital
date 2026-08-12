SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'ls_standings',
    'ls_fixtures',
    'ls_h2h',
    'ls_squad',
    'ls_sync_meta',
    'ls_sync_dataset_meta',
    'profiles',
    'match_attendance',
    'matches'
  )
ORDER BY tablename, policyname;

SELECT
  p.proname,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_execute
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'replace_ls_standings',
    'acquire_ls_sync_lock',
    'release_ls_sync_lock'
  )
ORDER BY p.proname;

SELECT
  has_table_privilege('anon', 'public.ls_standings', 'SELECT') AS anon_select,
  has_table_privilege('anon', 'public.ls_standings', 'INSERT,UPDATE,DELETE') AS anon_write,
  has_table_privilege('authenticated', 'public.ls_standings', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.ls_standings', 'INSERT,UPDATE,DELETE') AS auth_write;

SELECT public.acquire_ls_sync_lock('owner-a', 60) AS first_acquire;
SELECT public.acquire_ls_sync_lock('owner-b', 60) AS competing_acquire;
SELECT public.release_ls_sync_lock('owner-a') AS release;

BEGIN;

SELECT public.replace_ls_standings(
  999,
  '[
    {
      "competition_id": 999,
      "rank": 1,
      "team_id": "a",
      "team_name": "A",
      "points": 3,
      "played": 1,
      "won": 1,
      "drawn": 0,
      "lost": 0,
      "goals_for": 2,
      "goals_against": 0,
      "goal_diff": 2,
      "zone": null
    },
    {
      "competition_id": 999,
      "rank": 2,
      "team_id": "b",
      "team_name": "B",
      "points": 0,
      "played": 1,
      "won": 0,
      "drawn": 0,
      "lost": 1,
      "goals_for": 0,
      "goals_against": 2,
      "goal_diff": -2,
      "zone": null
    }
  ]'::jsonb
) AS inserted;

SELECT count(*) AS rows_inside_transaction
FROM public.ls_standings
WHERE competition_id = 999;

ROLLBACK;

SELECT count(*) AS rows_after_rollback
FROM public.ls_standings
WHERE competition_id = 999;
