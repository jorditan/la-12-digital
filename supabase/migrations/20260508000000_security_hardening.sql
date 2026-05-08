-- Migration: security hardening
-- 1) Restrict public exposure on profiles while preserving username availability checks
-- 2) Harden avatars storage policies with extension and size checks

-- ── profiles privacy ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.is_username_available(candidate_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text;
BEGIN
  normalized := trim(candidate_username);
  IF normalized IS NULL OR char_length(normalized) < 2 OR char_length(normalized) > 32 THEN
    RETURN false;
  END IF;
  IF normalized !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.username = normalized
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon, authenticated;

-- ── avatars storage hardening ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(COALESCE(storage.extension(name), '')) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    AND COALESCE((metadata->>'size')::int, 0) <= 2097152
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(COALESCE(storage.extension(name), '')) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    AND COALESCE((metadata->>'size')::int, 0) <= 2097152
  );
