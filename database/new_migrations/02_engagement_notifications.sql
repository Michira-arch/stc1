-- 1. Add Role to Profiles
-- User reports 'role' column already exists (with values 'USER', 'ADMIN').
-- ALTER TABLE public.profiles 
-- ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Create Notifications Table (Ensure it has user_id)
-- If table exists without user_id from a previous failed run, drop it to reset
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Inbox owner
  is_global BOOLEAN DEFAULT FALSE,
  
  data JSONB DEFAULT '{}'::jsonb, -- Deep links etc
  is_read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES public.profiles(id) -- Admin who sent it
);

-- 3. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Users can see their own notifications OR global notifications
CREATE POLICY "Users can view their own or global notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR is_global = true);

-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN')
    )
  );

-- 5. Permission Function (Optional helper)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
