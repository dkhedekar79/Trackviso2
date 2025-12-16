-- Fix user_stats table: Add id column if it doesn't exist
-- This handles cases where the table was created without the id column
-- Note: Since user_id is already the primary key, we'll add id as a regular column
DO $$ 
BEGIN
  -- Check if id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'id'
  ) THEN
    -- Check if there's already a primary key (user_id is likely the PK)
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'user_stats' 
      AND constraint_type = 'PRIMARY KEY'
    ) THEN
      -- Table already has a primary key, so add id as a regular BIGSERIAL column
      ALTER TABLE public.user_stats 
      ADD COLUMN id BIGSERIAL;
      
      -- Create a unique index on id (but don't make it primary key)
      CREATE UNIQUE INDEX IF NOT EXISTS user_stats_id_key ON public.user_stats(id);
    ELSE
      -- No primary key exists, so we can add id as primary key
      ALTER TABLE public.user_stats 
      ADD COLUMN id BIGSERIAL PRIMARY KEY;
    END IF;
  END IF;
END $$;

-- Ensure admin_users table exists and has correct structure
CREATE TABLE IF NOT EXISTS public.admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '{"manage_users": true, "manage_subscriptions": true, "view_analytics": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they work correctly
DROP POLICY IF EXISTS "Service role and authenticated users can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can delete admin users" ON public.admin_users;

-- Create simpler RLS policies that allow authenticated users to read
-- (Application logic will filter by email)
CREATE POLICY "Authenticated users can view admin users" ON public.admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage admin users" ON public.admin_users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  ) WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

