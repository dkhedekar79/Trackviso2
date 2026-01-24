-- Add has_seen_creddr_popup column to user_stats table
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS has_seen_creddr_popup BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_stats_creddr_popup ON public.user_stats(has_seen_creddr_popup);

