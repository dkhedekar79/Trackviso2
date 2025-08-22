
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
