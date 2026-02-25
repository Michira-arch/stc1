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
  s.id,
  -- Anonymity Logic: Nullify author_id and mask handle if is_anonymous is true
  case 
    when s.is_anonymous then null 
    else s.author_id 
  end as author_id,
  case
    when s.is_anonymous then 'Anonymous Student'
    else coalesce(p.handle, p.full_name, 'Student')
  end as author_handle,
  s.title,
  s.created_at,
  -- Combine title, author, date, description, and content into a single context chunk
  concat(
    'Title: ', s.title, E'\n', 
    'Author: ', case when s.is_anonymous then 'Anonymous Student' else coalesce(p.handle, p.full_name, 'Student') end, E'\n',
    'Posted on: ', to_char(s.created_at, 'YYYY-MM-DD HH24:MI'), E'\n',
    'Description: ', coalesce(s.description, ''), E'\n', 
    'Content: ', substring(s.content from 1 for 1000)
  ) as formatted_text,
  s.embedding
from public.stories s
left join public.profiles p on p.id = s.author_id
where s.is_hidden = false;
