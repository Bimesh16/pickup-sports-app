-- V10: Default and backfill for game_participants.joined_at

-- 1) Set a default value so future inserts don't need to provide joined_at explicitly
ALTER TABLE public.game_participants
  ALTER COLUMN joined_at SET DEFAULT now();

-- 2) Backfill any existing NULLs
UPDATE public.game_participants
SET joined_at = now()
WHERE joined_at IS NULL;
