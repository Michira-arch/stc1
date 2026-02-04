-- =============================================
-- Unicampus Upload Requests Schema
-- =============================================

-- CLEANUP (CAREFUL: DELETES DATA)
DROP TABLE IF EXISTS unicampus_upload_requests CASCADE;

-- Upload Requests Table
CREATE TABLE IF NOT EXISTS unicampus_upload_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- CHANGED: Reference public.profiles instead of auth.users to allow PostgREST joins
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    university_id TEXT NOT NULL REFERENCES unicampus_universities(id),
    course_code TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Exam', 'CAT')),
    year INTEGER,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'satisfied')),
    satisfied_by_paper_id UUID REFERENCES unicampus_papers(id),
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_unicampus_requests_uni ON unicampus_upload_requests(university_id);
CREATE INDEX IF NOT EXISTS idx_unicampus_requests_status ON unicampus_upload_requests(status);
CREATE INDEX IF NOT EXISTS idx_unicampus_requests_course ON unicampus_upload_requests(course_code);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

ALTER TABLE unicampus_upload_requests ENABLE ROW LEVEL SECURITY;

-- Select: Public can see requests (or maybe just authenticated?)
-- Let's allow public read for now so guests can see what's missing
CREATE POLICY "unicampus_requests_select"
    ON unicampus_upload_requests FOR SELECT
    USING (true);

-- Insert: Authenticated users only
CREATE POLICY "unicampus_requests_insert"
    ON unicampus_upload_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- Update: Requester can update their own request (e.g. description)
CREATE POLICY "unicampus_requests_update"
    ON unicampus_upload_requests FOR UPDATE
    USING (auth.uid() = requester_id);

-- Delete: Requester can cancel/delete
CREATE POLICY "unicampus_requests_delete"
    ON unicampus_upload_requests FOR DELETE
    USING (auth.uid() = requester_id);


-- =============================================
-- Helper Functions
-- =============================================

-- Fulfill Upload Request RPC
-- Atomically links a paper to a request and marks it as satisfied
CREATE OR REPLACE FUNCTION fulfill_upload_request(p_request_id UUID, p_paper_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE unicampus_upload_requests
    SET 
        status = 'satisfied',
        satisfied_by_paper_id = p_paper_id,
        updated_at = NOW()
    WHERE id = p_request_id;
END;
$$;
