-- Create desktop_access_requests table
CREATE TABLE IF NOT EXISTS public.desktop_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_desktop_access_requests_email ON public.desktop_access_requests(email);

-- Enable RLS
ALTER TABLE public.desktop_access_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'desktop_access_requests' AND policyname = 'Anyone can insert their email'
  ) THEN
    CREATE POLICY "Anyone can insert their email" ON public.desktop_access_requests
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'desktop_access_requests' AND policyname = 'Admins can view all requests'
  ) THEN
    CREATE POLICY "Admins can view all requests" ON public.desktop_access_requests
      FOR SELECT USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)); -- Assuming there is an admin_users table or similar logic
  END IF;
END $$;

