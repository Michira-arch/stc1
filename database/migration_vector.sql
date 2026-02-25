-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 1. Add embedding column to profiles table
-- Using 384 dimensions (common for models like all-MiniLM-L6-v2)
-- If using OpenAI (text-embedding-3-small), change to 1536
alter table public.profiles 
add column if not exists embedding vector(384);

-- 2. Add embedding column to stories table
alter table public.stories 
add column if not exists embedding vector(384);

-- 3. Create indexes for faster queries (IVFFlat)
-- Note: Indexes are most effective with sufficient data. 
-- 'lists' parameter should be adjusted based on table size (rows / 1000 is a good rule of thumb)
create index on public.profiles using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create index on public.stories using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. Create RPC function to search profiles by similarity
create or replace function match_profiles (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  full_name text,
  handle text,
  avatar_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    profiles.id,
    profiles.full_name,
    profiles.handle,
    profiles.avatar_url,
    1 - (profiles.embedding <=> query_embedding) as similarity
  from profiles
  where 1 - (profiles.embedding <=> query_embedding) > match_threshold
  order by profiles.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Create RPC function to search stories by similarity
-- Queries from formatted_stories view (not the base table) to bypass RLS
-- The view already filters is_hidden = false and masks anonymous author_ids
create or replace function match_stories (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
    id uuid,
    author_id uuid,
    title text,
    formatted_text text,
    similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    fs.id,
    fs.author_id,
    fs.title,
    fs.formatted_text,
    1 - (s.embedding <=> query_embedding) as similarity
  from public.formatted_stories fs
  join public.stories s on s.id = fs.id
  where 1 - (s.embedding <=> query_embedding) > match_threshold
  order by s.embedding <=> query_embedding
  limit match_count;
end;
$$;
