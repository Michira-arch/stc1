-- =========================================================================
-- AI Agent Integration Migration
-- Run this in Supabase Dashboard > SQL Editor
-- =========================================================================

-- 1. Trust settings per user (controls AI autonomy)
CREATE TABLE IF NOT EXISTS public.ai_trust_settings (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  navigation TEXT DEFAULT 'ask' CHECK (navigation IN ('ask', 'auto')),
  content_read TEXT DEFAULT 'ask' CHECK (content_read IN ('ask', 'auto')),
  content_write TEXT DEFAULT 'ask' CHECK (content_write IN ('ask', 'auto')),
  social TEXT DEFAULT 'ask' CHECK (social IN ('ask', 'auto')),
  profile TEXT DEFAULT 'ask' CHECK (profile IN ('ask', 'auto')),
  settings TEXT DEFAULT 'ask' CHECK (settings IN ('ask', 'auto')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for trust settings
ALTER TABLE public.ai_trust_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trust settings"
  ON public.ai_trust_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trust settings"
  ON public.ai_trust_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trust settings"
  ON public.ai_trust_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Audit log for all AI agent actions
CREATE TABLE IF NOT EXISTS public.ai_action_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  action_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  params JSONB,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'executed', 'denied', 'failed')),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for action log
ALTER TABLE public.ai_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own action log"
  ON public.ai_action_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own action log"
  ON public.ai_action_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can also insert (for edge function logging)
CREATE POLICY "Service role can insert action log"
  ON public.ai_action_log FOR INSERT
  WITH CHECK (true);

-- 3. Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_action_log_user_id ON public.ai_action_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_action_log_created_at ON public.ai_action_log(created_at DESC);
