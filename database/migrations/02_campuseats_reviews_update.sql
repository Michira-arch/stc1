-- Add user_name column to campuseats_reviews
ALTER TABLE campuseats_reviews ADD COLUMN IF NOT EXISTS user_name TEXT;

-- RLS Policies for campuseats_reviews

-- 1. Enable RLS (just in case)
ALTER TABLE campuseats_reviews ENABLE ROW LEVEL SECURITY;

-- 2. Allow everyone to read reviews
DROP POLICY IF EXISTS "campuseats_reviews_select" ON campuseats_reviews;
CREATE POLICY "campuseats_reviews_select" ON campuseats_reviews
    FOR SELECT USING (true);

-- 3. Allow authenticated users to insert reviews (must be their own user_id)
DROP POLICY IF EXISTS "campuseats_reviews_insert" ON campuseats_reviews;
CREATE POLICY "campuseats_reviews_insert" ON campuseats_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to update their own reviews
DROP POLICY IF EXISTS "campuseats_reviews_update" ON campuseats_reviews;
CREATE POLICY "campuseats_reviews_update" ON campuseats_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Allow users to delete their own reviews
DROP POLICY IF EXISTS "campuseats_reviews_delete" ON campuseats_reviews;
CREATE POLICY "campuseats_reviews_delete" ON campuseats_reviews
    FOR DELETE USING (auth.uid() = user_id);
