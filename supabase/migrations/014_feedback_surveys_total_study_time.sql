-- Store recorded study time (minutes) when user submitted product feedback
ALTER TABLE public.user_feedback_surveys
  ADD COLUMN IF NOT EXISTS total_study_time_minutes INTEGER;
