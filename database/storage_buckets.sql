-- 1. Create Bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('campuseats-assets', 'campuseats-assets', true)
on conflict (id) do nothing;

-- 2. Drop policies if they exist (using specific names to avoid collisions)
drop policy if exists "CampusEats Public Access" on storage.objects;
drop policy if exists "CampusEats Authenticated Upload" on storage.objects;
drop policy if exists "CampusEats Authenticated Update" on storage.objects;

-- 3. Create Policies

-- Allow public access to view files in this bucket
create policy "CampusEats Public Access"
  on storage.objects for select
  using ( bucket_id = 'campuseats-assets' );

-- Allow authenticated users to upload files to this bucket
create policy "CampusEats Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'campuseats-assets' and auth.role() = 'authenticated' );

-- Allow authenticated users to update files in this bucket
create policy "CampusEats Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'campuseats-assets' and auth.role() = 'authenticated' );
