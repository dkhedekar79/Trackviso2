-- Create user_schedules table to store AI-generated timetables
CREATE TABLE IF NOT EXISTS public.user_schedules (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_ai_generated BOOLEAN DEFAULT true,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  setup_data JSONB,
  ai_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_schedules_user_id ON public.user_schedules(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_schedules_created_at ON public.user_schedules(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own schedules
CREATE POLICY "Users can view their own schedules"
  ON public.user_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own schedules
CREATE POLICY "Users can insert their own schedules"
  ON public.user_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own schedules
CREATE POLICY "Users can update their own schedules"
  ON public.user_schedules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own schedules
CREATE POLICY "Users can delete their own schedules"
  ON public.user_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_schedules_updated_at
  BEFORE UPDATE ON public.user_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_user_schedules_updated_at();

