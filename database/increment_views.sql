-- Function to safely increment story views without giving update permissions to public
create or replace function public.increment_story_view(p_story_id uuid)
returns void
language plpgsql
security definer -- Functions run with privileges of the creator (postgres/admin), bypassing RLS
as $$
begin
  update public.stories
  set views_count = views_count + 1
  where id = p_story_id;
end;
$$;
