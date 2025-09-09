-- Create table to store poll vote counts
CREATE TABLE IF NOT EXISTS premium_poll (
  id SERIAL PRIMARY KEY,
  vote_type VARCHAR(10) NOT NULL UNIQUE CHECK (vote_type IN ('yes', 'no')),
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create table to track individual user votes (to prevent duplicate voting)
CREATE TABLE IF NOT EXISTS premium_poll_votes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('yes', 'no')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id)
);

-- Initialize poll with zero counts
INSERT INTO premium_poll (vote_type, count) 
VALUES ('yes', 0), ('no', 0)
ON CONFLICT (vote_type) DO NOTHING;

-- Create function to increment poll count
CREATE OR REPLACE FUNCTION increment_poll_count(vote_type TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE premium_poll 
  SET count = count + 1, updated_at = NOW()
  WHERE premium_poll.vote_type = increment_poll_count.vote_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security (RLS)
ALTER TABLE premium_poll ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_poll_votes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read poll results
CREATE POLICY "Allow public read on premium_poll" ON premium_poll
  FOR SELECT USING (true);

-- Allow authenticated users to read their own votes
CREATE POLICY "Users can read own votes" ON premium_poll_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their vote (once)
CREATE POLICY "Users can insert own vote" ON premium_poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- App Data Tables (Per-user storage for cross-browser syncing)
-- =============================================================

-- Enable pgcrypto for gen_random_uuid if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) User Stats (one row per user)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  prestige_level INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- minutes
  total_xp_earned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date TIMESTAMPTZ NULL,
  weekly_xp INTEGER DEFAULT 0,
  subject_mastery JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  daily_quests JSONB DEFAULT '[]'::jsonb,
  weekly_quests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_stats_select_own" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_stats_insert_own" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_stats_update_own" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 2) Study Sessions (many per user)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  duration_minutes NUMERIC(10,2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  task TEXT,
  mood TEXT,
  reflection TEXT,
  difficulty INTEGER,
  is_task_complete BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  bonuses JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_time ON study_sessions(user_id, timestamp DESC);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_sessions_select_own" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_insert_own" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_update_own" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_delete_own" ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 3) Subjects (many per user)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  goal_hours NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_select_own" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subjects_insert_own" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subjects_update_own" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "subjects_delete_own" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- 4) Tasks (many per user)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  time INTEGER, -- minutes estimate
  priority TEXT,
  scheduled_date DATE,
  done BOOLEAN DEFAULT FALSE,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, scheduled_date);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: simple trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_stats') THEN
    CREATE TRIGGER set_updated_at_user_stats BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_subjects') THEN
    CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_tasks') THEN
    CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;