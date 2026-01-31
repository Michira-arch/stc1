-- Add metadata column to leaderboards table
ALTER TABLE public.leaderboards 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.leaderboards.metadata IS 'Stores flexible UI configuration like icon, theme_color, cover_image';
