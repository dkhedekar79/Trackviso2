-- Create mastery_activities table to track blurt mode, mock exam mode, and topic generation
CREATE TABLE IF NOT EXISTS public.mastery_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('blurt', 'mock_exam', 'topic_generation')),
  subject TEXT NOT NULL,
  qualification TEXT,
  exam_board TEXT,
  topics JSONB, -- Array of topic IDs or names
  topic_count INTEGER,
  score DECIMAL, -- For blurt and mock exam (percentage)
  tier TEXT, -- For mock exam (higher/foundation)
  total_marks INTEGER, -- For mock exam
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data (analysis, marking results, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices for better query performance
CREATE INDEX idx_mastery_activities_user_id ON public.mastery_activities(user_id);
CREATE INDEX idx_mastery_activities_activity_type ON public.mastery_activities(activity_type);
CREATE INDEX idx_mastery_activities_subject ON public.mastery_activities(subject);
CREATE INDEX idx_mastery_activities_created_at ON public.mastery_activities(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.mastery_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activities" ON public.mastery_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.mastery_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON public.mastery_activities
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_mastery_activities_timestamp BEFORE UPDATE ON public.mastery_activities
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

