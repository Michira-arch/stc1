-- Create a table for active rooms
create table rooms (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id), -- Optional, allows guest rooms if null
  is_active boolean default true
);

-- RLS Policies (Allow Open Access for Prototype)
alter table rooms enable row level security;

-- Allow anyone to read rooms (simplification for "joining" by ID)
create policy "Public can view rooms"
  on rooms for select
  using ( true );

-- Allow anyone to create a room
create policy "Public can insert rooms"
  on rooms for insert
  with check ( true );
