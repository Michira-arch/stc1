-- Enable UUID extension
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  cover_url text,
  bio text,
  -- AppSettings mapping
  font_size text default 'base' check (font_size in ('sm', 'base', 'lg')),
  is_italic boolean default false,
  privacy_settings jsonb default '{"showBio": true, "showTimeline": true}'::jsonb,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


ALTER TABLE public.profiles ADD COLUMN is_certified BOOLEAN DEFAULT FALSE;

-------------------------------------------------------------------------------
-- 2. Stories Table
-------------------------------------------------------------------------------
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) not null,
  title text not null,
  description text, -- Hook/Preview text
  content text,     -- HTML Content
  image_url text,   -- Cover image
  audio_url text,   -- Audio narration file
  views_count int default 0,
  is_hidden boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-------------------------------------------------------------------------------
-- 3. Comments Table
-------------------------------------------------------------------------------
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  parent_id uuid references public.comments(id) on delete cascade, -- Recursive definition
  content text not null,
  
  created_at timestamptz default now()
);

-------------------------------------------------------------------------------
-- 4. Likes Table
-------------------------------------------------------------------------------
create table public.likes (
  user_id uuid references public.profiles(id) not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, story_id)
);

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------------------

-- Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Stories
alter table public.stories enable row level security;

create policy "Stories are viewable by everyone"
  on public.stories for select
  using ( true );

create policy "Users can insert their own stories."
  on public.stories for insert
  with check ( auth.uid() = author_id );

create policy "Users can update their own stories."
  on public.stories for update
  using ( auth.uid() = author_id );

create policy "Users can delete their own stories."
  on public.stories for delete
  using ( auth.uid() = author_id );

-- Comments
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone."
  on public.comments for select
  using ( true );

create policy "Authenticated users can insert comments."
  on public.comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments."
  on public.comments for delete
  using ( auth.uid() = user_id );

-- Likes
alter table public.likes enable row level security;

create policy "Likes are viewable by everyone."
  on public.likes for select
  using ( true );

create policy "Authenticated users can insert likes."
  on public.likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes."
  on public.likes for delete
  using ( auth.uid() = user_id );

-------------------------------------------------------------------------------
-- STORAGE BUCKETS
-------------------------------------------------------------------------------
-- We try to insert into storage.buckets. 
-- Note: This requires the SQL editor to have permissions on the storage schema.
-- If this fails, create buckets manually in the dashboard: 'avatars', 'covers', 'story-content'

insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('story-content', 'story-content', true) -- For both audio and images
on conflict (id) do nothing;

-- Storage Policies (Simplified for 'storage.objects')
-- NOTE: You must enable RLS on storage.objects in the dashboard if it isn't already.

create policy "Public Access to all buckets"
  on storage.objects for select
  using ( bucket_id in ('avatars', 'covers', 'story-content') );

create policy "Authenticated users can upload to buckets"
  on storage.objects for insert
  with check ( auth.role() = 'authenticated' AND bucket_id in ('avatars', 'covers', 'story-content') );

create policy "Users can update their own objects"
  on storage.objects for update
  using ( auth.uid() = owner );

create policy "Users can delete their own objects"
  on storage.objects for delete
  using ( auth.uid() = owner );


-------------------------------------------------------------------------------
-- AUTH TRIGGERS
-------------------------------------------------------------------------------

-- Function to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
-- Drop if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
