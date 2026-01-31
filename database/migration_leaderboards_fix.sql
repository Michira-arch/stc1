-- Fix RLS policies to allow creation
-- 1. Allow authenticated users to create new leaderboards
create policy "Authenticated users can create leaderboards"
on public.leaderboards
for insert
with check (auth.role() = 'authenticated');

-- 2. Allow authenticated users to add candidates (ranked_entities)
create policy "Authenticated users can add entities"
on public.ranked_entities
for insert
with check (auth.role() = 'authenticated');


