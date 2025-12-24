-- Migration to auto-calculate user_stats from study_sessions
-- This ensures total_study_time and total_xp_earned are always accurate

-- Function to update user_stats when a study_session is inserted/updated
CREATE OR REPLACE FUNCTION update_user_stats_from_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_stats with aggregated data from study_sessions
  UPDATE public.user_stats
  SET
    total_study_time = (
      SELECT COALESCE(SUM(duration_minutes), 0)
      FROM public.study_sessions
      WHERE user_id = NEW.user_id
    ),
    total_xp_earned = (
      SELECT COALESCE(SUM(xp_earned), 0)
      FROM public.study_sessions
      WHERE user_id = NEW.user_id
    ),
    total_sessions = (
      SELECT COUNT(*)
      FROM public.study_sessions
      WHERE user_id = NEW.user_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- If no user_stats record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (
      user_id,
      total_study_time,
      total_xp_earned,
      total_sessions,
      xp,
      level,
      current_streak,
      longest_streak
    )
    VALUES (
      NEW.user_id,
      COALESCE(NEW.duration_minutes, 0),
      COALESCE(NEW.xp_earned, 0),
      1,
      0,
      1,
      0,
      0
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_study_time = (
        SELECT COALESCE(SUM(duration_minutes), 0)
        FROM public.study_sessions
        WHERE user_id = NEW.user_id
      ),
      total_xp_earned = (
        SELECT COALESCE(SUM(xp_earned), 0)
        FROM public.study_sessions
        WHERE user_id = NEW.user_id
      ),
      total_sessions = (
        SELECT COUNT(*)
        FROM public.study_sessions
        WHERE user_id = NEW.user_id
      ),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user_stats when study_session is inserted
DROP TRIGGER IF EXISTS trigger_update_user_stats_on_session_insert ON public.study_sessions;
CREATE TRIGGER trigger_update_user_stats_on_session_insert
  AFTER INSERT ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_from_sessions();

-- Function to handle deletions
CREATE OR REPLACE FUNCTION update_user_stats_on_session_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_stats after a session is deleted
  UPDATE public.user_stats
  SET
    total_study_time = COALESCE((
      SELECT SUM(duration_minutes)
      FROM public.study_sessions
      WHERE user_id = OLD.user_id
    ), 0),
    total_xp_earned = COALESCE((
      SELECT SUM(xp_earned)
      FROM public.study_sessions
      WHERE user_id = OLD.user_id
    ), 0),
    total_sessions = COALESCE((
      SELECT COUNT(*)
      FROM public.study_sessions
      WHERE user_id = OLD.user_id
    ), 0),
    updated_at = NOW()
  WHERE user_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user_stats when study_session is deleted
DROP TRIGGER IF EXISTS trigger_update_user_stats_on_session_delete ON public.study_sessions;
CREATE TRIGGER trigger_update_user_stats_on_session_delete
  AFTER DELETE ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_session_delete();

-- Function to backfill/recalculate all user stats from existing sessions
CREATE OR REPLACE FUNCTION recalculate_all_user_stats()
RETURNS void AS $$
BEGIN
  -- Update all user_stats records with accurate totals from study_sessions
  UPDATE public.user_stats us
  SET
    total_study_time = COALESCE((
      SELECT SUM(duration_minutes)
      FROM public.study_sessions ss
      WHERE ss.user_id = us.user_id
    ), 0),
    total_xp_earned = COALESCE((
      SELECT SUM(xp_earned)
      FROM public.study_sessions ss
      WHERE ss.user_id = us.user_id
    ), 0),
    total_sessions = COALESCE((
      SELECT COUNT(*)
      FROM public.study_sessions ss
      WHERE ss.user_id = us.user_id
    ), 0),
    updated_at = NOW();
  
  -- Create user_stats records for users who have sessions but no stats
  INSERT INTO public.user_stats (
    user_id,
    total_study_time,
    total_xp_earned,
    total_sessions,
    xp,
    level,
    current_streak,
    longest_streak
  )
  SELECT DISTINCT
    ss.user_id,
    COALESCE(SUM(ss.duration_minutes), 0) as total_study_time,
    COALESCE(SUM(ss.xp_earned), 0) as total_xp_earned,
    COUNT(*) as total_sessions,
    0 as xp,
    1 as level,
    0 as current_streak,
    0 as longest_streak
  FROM public.study_sessions ss
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_stats us WHERE us.user_id = ss.user_id
  )
  GROUP BY ss.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_study_time = EXCLUDED.total_study_time,
    total_xp_earned = EXCLUDED.total_xp_earned,
    total_sessions = EXCLUDED.total_sessions,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Run the backfill function to fix existing data
SELECT recalculate_all_user_stats();

