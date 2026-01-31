-- 1. Leaderboards Table (Categories)
create table if not exists public.leaderboards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  slug text unique not null, -- e.g. 'lecturers-clarity', 'best-cafeteria-food'
  entity_type text not null, -- e.g. 'lecturer', 'food', 'project' for frontend rendering hints
  created_at timestamptz default now()
);

-- 2. Ranked Entities (The items being voted on)
create table if not exists public.ranked_entities (
  id uuid default gen_random_uuid() primary key,
  leaderboard_id uuid references public.leaderboards(id) on delete cascade not null,
  name text not null,
  image_url text, 
  metadata jsonb default '{}'::jsonb, -- Flexible fields (e.g. { "department": "Science" })
  elo_score int default 1200,
  match_count int default 0,
  created_at timestamptz default now()
);

-- 3. Ranking Votes (History of matches)
create table if not exists public.ranking_votes (
  id uuid default gen_random_uuid() primary key,
  leaderboard_id uuid references public.leaderboards(id) on delete cascade not null,
  winner_id uuid references public.ranked_entities(id) on delete cascade,
  loser_id uuid references public.ranked_entities(id) on delete cascade,
  is_draw boolean default false,
  user_id uuid references auth.users(id), -- Nullable for anon votes if we want
  created_at timestamptz default now()
);

-- RLS Policies

-- Leaderboards: Readable by all, Insertable by admins (service role)
alter table public.leaderboards enable row level security;
create policy "Leaderboards are viewable by everyone" 
  on public.leaderboards for select using (true);

-- Ranked Entities: Readable by all, Insertable by admins
alter table public.ranked_entities enable row level security;
create policy "Ranked entities are viewable by everyone" 
  on public.ranked_entities for select using (true);
  
-- Allow updating ELO scores? 
-- Ideally ELO updates happen via Edge Function to prevent cheating, 
-- but for MVP/Client-side, everyone needs update access OR we use a stored procedure.
-- Let's use a stored procedure for voting to be safe and clean.

-- Rankings Votes: Insertable by authenticated users
alter table public.ranking_votes enable row level security;
create policy "Users can insert votes" 
  on public.ranking_votes for insert with check (auth.role() = 'authenticated');
create policy "Votes are viewable by everyone" 
  on public.ranking_votes for select using (true);


-- 4. Stored Procedure for Voting (Handles Elo Math atomically)
create or replace function public.submit_vote(
  match_leaderboard_id uuid,
  match_winner_id uuid,
  match_loser_id uuid,
  match_is_draw boolean
) returns void as $$
declare
  winner_elo int;
  loser_elo int;
  expected_winner float;
  expected_loser float;
  k_factor int := 32;
  new_winner_elo int;
  new_loser_elo int;
  actual_score_winner float;
  actual_score_loser float;
begin
  -- 1. Get current scores
  select elo_score into winner_elo from public.ranked_entities where id = match_winner_id;
  select elo_score into loser_elo from public.ranked_entities where id = match_loser_id;

  -- 2. Calculate Expected Scores
  -- E = 1 / (1 + 10 ^ ((OpponentElo - MyElo) / 400))
  expected_winner := 1.0 / (1.0 + power(10.0, (loser_elo - winner_elo)::float / 400.0));
  expected_loser := 1.0 / (1.0 + power(10.0, (winner_elo - loser_elo)::float / 400.0));

  -- 3. Determine Actual Scores based on outcome
  if match_is_draw then
    actual_score_winner := 0.5;
    actual_score_loser := 0.5;
  else
    actual_score_winner := 1.0;
    actual_score_loser := 0.0;
  end if;

  -- 4. Calculate New Ratings
  new_winner_elo := round(winner_elo + k_factor * (actual_score_winner - expected_winner));
  new_loser_elo := round(loser_elo + k_factor * (actual_score_loser - expected_loser));

  -- 5. Update Entities
  update public.ranked_entities 
  set elo_score = new_winner_elo, match_count = match_count + 1 
  where id = match_winner_id;

  update public.ranked_entities 
  set elo_score = new_loser_elo, match_count = match_count + 1 
  where id = match_loser_id;

  -- 6. Log the vote
  insert into public.ranking_votes (leaderboard_id, winner_id, loser_id, is_draw, user_id)
  values (match_leaderboard_id, match_winner_id, match_loser_id, match_is_draw, auth.uid());

end;
$$ language plpgsql security definer;

-- Indexes for performance
create index idx_ranked_entities_leaderboard on public.ranked_entities(leaderboard_id);
create index idx_ranked_entities_elo on public.ranked_entities(leaderboard_id, elo_score desc);
