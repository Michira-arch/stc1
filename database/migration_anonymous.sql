-- 1. Add is_anonymous column to stories
alter table public.stories 
add column if not exists is_anonymous boolean default false;



create or replace view public.formatted_stories as
select 
  s.id,
  s.title,
  s.description,
  s.content,
  s.image_url,
  s.audio_url,
  s.views_count,
  s.is_hidden,
  s.is_anonymous,
  s.created_at,
  s.updated_at,
  -- Logic to mask author
  case 
    when s.is_anonymous then null 
    else s.author_id 
  end as author_id
from public.stories s;



-- Drop existing policy
drop policy if exists "Stories are viewable by everyone" on public.stories;



create policy "Recalibrated Access to Stories"
  on public.stories for select
  using (
    -- Everyone can see non-hidden stories
    is_hidden = false
    -- OR
    -- The author can see their own stories (even if hidden)
    or auth.uid() = author_id
  );

