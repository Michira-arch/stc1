-- Create a table to store FCM tokens for users
create table if not exists public.fcm_tokens (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  token text not null,
  platform text check (platform in ('web', 'ios', 'android', 'other')) default 'web',
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  
  -- Ensure one token is only stored once
  constraint fcm_tokens_token_key unique (token)
);

-- Enable Row Level Security
alter table public.fcm_tokens enable row level security;

-- Policies

-- Users can view their own tokens (optional, mostly for debugging)
create policy "Users can view their own fcm tokens"
  on public.fcm_tokens for select
  using (auth.uid() = user_id);

-- Users can insert their own tokens
create policy "Users can insert their own fcm tokens"
  on public.fcm_tokens for insert
  with check (auth.uid() = user_id);

-- Users can update their own tokens (e.g. updating last_seen_at)
create policy "Users can update their own fcm tokens"
  on public.fcm_tokens for update
  using (auth.uid() = user_id);

-- Users can delete their own tokens (e.g. on logout)
create policy "Users can delete their own fcm tokens"
  on public.fcm_tokens for delete
  using (auth.uid() = user_id);

-- Create an index on user_id for faster lookups when sending notifications
create index if not exists fcm_tokens_user_id_idx on public.fcm_tokens (user_id);
