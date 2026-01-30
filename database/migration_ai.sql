-- 1. Create table to track user AI usage
create table if not exists public.user_ai_usage (
  user_id uuid references auth.users not null primary key,
  requests_today int default 0,
  last_reset_date date default current_date,
  is_premium boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_ai_usage enable row level security;

-- Policies
create policy "Users can view their own usage"
  on public.user_ai_usage for select
  using ( auth.uid() = user_id );

-- 2. Create a view for "formatted_stories" to simplify RAG context retrieval
-- Drop first to avoid "cannot drop columns" error when replacing
drop view if exists public.formatted_stories;

create or replace view public.formatted_stories as
select
  id,
  -- Anonymity Logic: Nullify author_id if is_anonymous is true
  case 
    when is_anonymous then null 
    else author_id 
  end as author_id,
  title,
  -- Combine title, description, and content into a single context chunk
  concat(
    'Title: ', title, E'\n', 
    'Description: ', coalesce(description, ''), E'\n', 
    'Content: ', substring(content from 1 for 1000), E'\n',
    'Is Anonymous: ', case when is_anonymous then 'Yes' else 'No' end
  ) as formatted_text,
  embedding
from public.stories
where is_hidden = false;
