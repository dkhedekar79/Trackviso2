-- Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  prestige_level INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  streak_savers INTEGER DEFAULT 3,
  badges JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  unlocked_titles JSONB DEFAULT '[]'::jsonb,
  current_title TEXT DEFAULT 'Rookie Scholar',
  weekly_xp INTEGER DEFAULT 0,
  weekly_rank INTEGER DEFAULT 0,
  friends JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  xp_multiplier DECIMAL DEFAULT 1.0,
  premium_skins JSONB DEFAULT '[]'::jsonb,
  current_skin TEXT DEFAULT 'default',
  subject_mastery JSONB DEFAULT '{}'::jsonb,
  weekly_goal INTEGER DEFAULT 0,
  weekly_progress INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  last_reward_time TIMESTAMPTZ,
  reward_streak INTEGER DEFAULT 0,
  lucky_streak INTEGER DEFAULT 0,
  jackpot_count INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  xp_events JSONB DEFAULT '[]'::jsonb,
  daily_quests JSONB DEFAULT '[]'::jsonb,
  weekly_quests JSONB DEFAULT '[]'::jsonb,
  completed_quests_today INTEGER DEFAULT 0,
  website_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  difficulty DECIMAL DEFAULT 1.0,
  mood TEXT DEFAULT 'neutral',
  xp_earned INTEGER,
  bonuses JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create topic_progress table
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  progress_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- Create user_subjects table
CREATE TABLE IF NOT EXISTS public.user_subjects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_hours DECIMAL DEFAULT 0,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Create user_tasks table
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  done BOOLEAN DEFAULT false,
  done_at BIGINT,
  priority TEXT DEFAULT 'medium',
  subject_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Create indices for better query performance
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_timestamp ON public.study_sessions(timestamp);
CREATE INDEX idx_topic_progress_user_id ON public.topic_progress(user_id);
CREATE INDEX idx_user_subjects_user_id ON public.user_subjects(user_id);
CREATE INDEX idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_done ON public.user_tasks(done);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for study_sessions
CREATE POLICY "Users can view their own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for topic_progress
CREATE POLICY "Users can view their own progress" ON public.topic_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.topic_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_subjects
CREATE POLICY "Users can view their own subjects" ON public.user_subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" ON public.user_subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON public.user_subjects
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON public.user_subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_tasks
CREATE POLICY "Users can view their own tasks" ON public.user_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.user_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.user_tasks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.user_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_timestamp BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_topic_progress_timestamp BEFORE UPDATE ON public.topic_progress
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_subjects_timestamp BEFORE UPDATE ON public.user_subjects
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_tasks_timestamp BEFORE UPDATE ON public.user_tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
