-- Store user feature requests from the in-app feedback survey
ALTER TABLE public.user_feedback_surveys
  ADD COLUMN IF NOT EXISTS feature_requests TEXT;
