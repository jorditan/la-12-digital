-- Migration: match_attendance table for Mi Historial de Partidos
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Tabla principal
CREATE TABLE public.match_attendance (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id    varchar(32) NOT NULL,
  attended    boolean     NOT NULL DEFAULT true,
  note        text        CHECK (char_length(note) <= 280),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);

-- 2. Índices
CREATE INDEX idx_match_attendance_user_id  ON public.match_attendance(user_id);
CREATE INDEX idx_match_attendance_match_id ON public.match_attendance(match_id);

-- 3. Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_attendance_updated_at
  BEFORE UPDATE ON public.match_attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Row Level Security
ALTER TABLE public.match_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attendance"
  ON public.match_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance"
  ON public.match_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
  ON public.match_attendance FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attendance"
  ON public.match_attendance FOR DELETE
  USING (auth.uid() = user_id);
