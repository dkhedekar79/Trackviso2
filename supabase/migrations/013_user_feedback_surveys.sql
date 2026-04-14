-- User feedback survey responses (shown in Admin panel)
CREATE TABLE IF NOT EXISTS public.user_feedback_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  website_time_minutes INTEGER,
  improvements TEXT,
  bugs TEXT,
  not_as_good TEXT,
  premium_blockers TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_surveys_created_at
  ON public.user_feedback_surveys (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_feedback_surveys_user_id
  ON public.user_feedback_surveys (user_id);

ALTER TABLE public.user_feedback_surveys ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert only their own row
CREATE POLICY "Users insert own feedback survey"
  ON public.user_feedback_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No SELECT for authenticated role; admin reads via service role
