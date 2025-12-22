-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id) -- A user can only be referred once
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Users can view their own referrals'
  ) THEN
    CREATE POLICY "Users can view their own referrals" ON public.referrals
      FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Users can insert their own referrals'
  ) THEN
    CREATE POLICY "Users can insert their own referrals" ON public.referrals
      FOR INSERT WITH CHECK (auth.uid() = referred_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'System can update referrals'
  ) THEN
    CREATE POLICY "System can update referrals" ON public.referrals
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

