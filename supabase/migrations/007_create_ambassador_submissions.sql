-- Create ambassador_submissions table
CREATE TABLE IF NOT EXISTS public.ambassador_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'tiktok', 'youtube', 'instagram'
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ambassador_submissions_user_id ON public.ambassador_submissions(user_id);

-- Enable RLS
ALTER TABLE public.ambassador_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ambassador_submissions' AND policyname = 'Users can view their own submissions'
  ) THEN
    CREATE POLICY "Users can view their own submissions" ON public.ambassador_submissions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ambassador_submissions' AND policyname = 'Users can insert their own submissions'
  ) THEN
    CREATE POLICY "Users can insert their own submissions" ON public.ambassador_submissions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

