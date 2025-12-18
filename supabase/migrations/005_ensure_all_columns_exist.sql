-- Ensure all required columns exist in user_stats table
-- This migration is idempotent - safe to run multiple times

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Check and add badges if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'badges'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN badges JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add achievements if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'achievements'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add unlocked_titles if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'unlocked_titles'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN unlocked_titles JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add friends if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'friends'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN friends JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add challenges if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'challenges'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN challenges JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add premium_skins if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'premium_skins'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN premium_skins JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add current_skin if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'current_skin'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN current_skin TEXT DEFAULT 'default';
  END IF;

  -- Check and add xp_events if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'xp_events'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN xp_events JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add daily_quests if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'daily_quests'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN daily_quests JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add weekly_quests if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'weekly_quests'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN weekly_quests JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add completed_quests_today if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'completed_quests_today'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN completed_quests_today INTEGER DEFAULT 0;
  END IF;

  -- Check and add website_time_minutes if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'website_time_minutes'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN website_time_minutes INTEGER DEFAULT 0;
  END IF;

  -- Check and add pomodoro_cycles_completed if missing (for future use)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'pomodoro_cycles_completed'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN pomodoro_cycles_completed INTEGER DEFAULT 0;
  END IF;
END $$;

-- Refresh schema cache (PostgREST will pick up changes on next request)
NOTIFY pgrst, 'reload schema';

