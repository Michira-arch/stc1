-- Add handle column to profiles
alter table public.profiles 
add column if not exists handle text unique;

-- Update the handle_new_user function to include handle from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, handle)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    new.raw_user_meta_data->>'handle' -- Can be null
  );
  return new;
end;
$$ language plpgsql security definer;
