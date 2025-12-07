-- Create admin_users table to track admin status
CREATE TABLE IF NOT EXISTS public.admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '{"manage_users": true, "manage_subscriptions": true, "view_analytics": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_users
-- Only admins can view all admin users
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Only admins can insert new admins
CREATE POLICY "Admins can manage admin users" ON public.admin_users
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Only admins can update admin users
CREATE POLICY "Admins can update admin users" ON public.admin_users
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  ) WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Create user_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.user_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_logs
ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view user logs" ON public.user_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Only admins can insert logs
CREATE POLICY "Admins can insert logs" ON public.user_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );
