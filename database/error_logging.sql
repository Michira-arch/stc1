-- Create a table for remote error logging
create table if not exists public.error_logs (
  id uuid default gen_random_uuid() primary key,
  error_hash text unique not null, -- Unique key composed of message + stack + ua
  error_message text not null,
  stack_trace text,
  user_agent text,
  occurrences int default 1,
  
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  
  -- Metadata for the *latest* occurrence
  latest_user_id uuid references auth.users(id), 
  app_version text
);

-- RLS
alter table public.error_logs enable row level security;

-- Allow anyone to call the RPC function (which inserts internally)
create policy "Enable insert/update for all users"
on public.error_logs
for all
to public
using (true)
with check (true);


-- RPC Function for Atomic Increment
create or replace function log_client_error(
    p_error_hash text,
    p_error_message text,
    p_stack_trace text,
    p_user_agent text,
    p_user_id uuid,
    p_app_version text
)
returns void
language plpgsql
security definer -- Run as owner to ensure we can upsert regardless of strict RLS quirks
as $$
begin
    insert into public.error_logs (
        error_hash,
        error_message,
        stack_trace,
        user_agent,
        latest_user_id,
        app_version,
        occurrences,
        last_seen_at
    ) values (
        p_error_hash,
        p_error_message,
        p_stack_trace,
        p_user_agent,
        p_user_id,
        p_app_version,
        1,
        now()
    )
    on conflict (error_hash) do update
    set 
        occurrences = error_logs.occurrences + 1,
        last_seen_at = now(),
        latest_user_id = p_user_id,
        app_version = p_app_version;
end;
$$;
