-- Add website_time_minutes column to user_stats if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats' 
    AND column_name = 'website_time_minutes'
  ) THEN
    ALTER TABLE public.user_stats 
    ADD COLUMN website_time_minutes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Ensure RLS policies allow users to read and update website_time_minutes
-- The existing policies in 001_create_tables.sql should already cover this
-- But let's verify the policies exist and allow access to website_time_minutes
-- Note: Service role automatically bypasses RLS, so API calls will work

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '{"manage_users": true, "manage_subscriptions": true, "view_analytics": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for admin_users if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'admin_users'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.admin_users;

-- Create RLS policies for admin_users
-- Note: Service role (used by API) bypasses RLS automatically, but we add explicit policies for client access
-- For now, allow service role and authenticated users to check (will be filtered by application logic)
CREATE POLICY "Service role and authenticated users can view admin users" ON public.admin_users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "Service role can manage admin users" ON public.admin_users
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Service role can update admin users" ON public.admin_users
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
  ) WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Service role can delete admin users" ON public.admin_users
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Create user_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_logs if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_logs'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Admins can view user logs" ON public.user_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON public.user_logs;

-- Create RLS policies for user_logs
-- Service role (used by API) can access, authenticated users can view (filtered by app logic)
CREATE POLICY "Service role and authenticated users can view user logs" ON public.user_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "Service role can insert logs" ON public.user_logs
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

