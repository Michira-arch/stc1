-- Migration: Add video_url column to stories table
-- Purpose: Support video posts in the feed. Videos are standalone (no image attachment when video is present).
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN public.stories.video_url IS 'URL to video stored in Cloudflare R2. Mutually exclusive with image_url in new posts.';
