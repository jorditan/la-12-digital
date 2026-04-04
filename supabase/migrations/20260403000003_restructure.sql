-- Migration: restructure schema
-- Adds matches cache table, bio to profiles, and FK constraint on match_attendance
-- Run in Supabase Dashboard → SQL Editor

-- ── 1. matches cache ──────────────────────────────────────────────────────────
-- Stores match data from the external API so attendance records are self-contained.
-- Populated client-side when a user marks attendance.

CREATE TABLE public.matches (
  id              varchar(32)  PRIMARY KEY,  -- fixtureId from API
  date            timestamptz  NOT NULL,
  home_team_id    int          NOT NULL,
  home_team_name  text         NOT NULL,
  home_team_logo  text,
  away_team_id    int          NOT NULL,
  away_team_name  text         NOT NULL,
  away_team_logo  text,
  goals_home      smallint,
  goals_away      smallint,
  venue           text,
  competition     text,
  synced_at       timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Match data is public (no personal info)
CREATE POLICY "Matches are publicly readable"
  ON public.matches FOR SELECT USING (true);

-- Any authenticated user can cache a match (happens when marking attendance)
CREATE POLICY "Authenticated users can upsert matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update matches"
  ON public.matches FOR UPDATE
  USING (auth.role() = 'authenticated');


-- ── 2. profiles: add bio column ───────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text CHECK (char_length(bio) <= 160);


-- ── 3. match_attendance: add FK to matches ────────────────────────────────────
-- NOT VALID = existing rows are grandfathered, new rows must satisfy the FK.
-- Run VALIDATE CONSTRAINT later once all existing attendance rows have a
-- corresponding matches row (happens naturally as users interact with the app).

ALTER TABLE public.match_attendance
  ADD CONSTRAINT fk_match_attendance_match
  FOREIGN KEY (match_id) REFERENCES public.matches(id)
  ON DELETE CASCADE
  NOT VALID;


-- ── 4. Remove redundant attended column ──────────────────────────────────────
-- A row in match_attendance always means attended=true; absence means not attended.
-- Drop the column to remove the redundancy. The app already uses presence/absence logic.

-- (Optional — uncomment if you want to clean up. Requires updating app code first.)
-- ALTER TABLE public.match_attendance DROP COLUMN IF EXISTS attended;
