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
create or replace function match_stories (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
    id uuid,
    author_id uuid,
    title text,
    description text,
    content text,
    image_url text,
    audio_url text,
    views_count int,
    is_hidden boolean,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float
)
language plpgsql
as $$
begin
  return query
  select
    stories.id,
    stories.author_id,
    stories.title,
    stories.description,
    stories.content,
    stories.image_url,
    stories.audio_url,
    stories.views_count,
    stories.is_hidden,
    stories.created_at,
    stories.updated_at,
    1 - (stories.embedding <=> query_embedding) as similarity
  from stories
  where 1 - (stories.embedding <=> query_embedding) > match_threshold
  order by stories.embedding <=> query_embedding
  limit match_count;
end;
$$;
