-- =============================================
-- Unicampus Schema
-- Past Papers & CATs Management
-- =============================================

-- Universities Table (static reference data)
CREATE TABLE IF NOT EXISTS unicampus_universities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Universities
INSERT INTO unicampus_universities (id, name, short_name) VALUES
    ('uon', 'University of Nairobi', 'UoN'),
    ('ku', 'Kenyatta University', 'KU'),
    ('jkuat', 'JKUAT', 'JKUAT'),
    ('mku', 'Mount Kenya University', 'MKU'),
    ('strathmore', 'Strathmore University', 'Strathmore'),
    ('usiu', 'USIU Africa', 'USIU'),
    ('tu-k', 'Technical University of Kenya', 'TU-K'),
    ('egerton', 'Egerton University', 'Egerton'),
    ('moi', 'Moi University', 'Moi'),
    ('maseno', 'Maseno University', 'Maseno')
ON CONFLICT (id) DO NOTHING;

-- Papers Table
CREATE TABLE IF NOT EXISTS unicampus_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    university_id TEXT NOT NULL REFERENCES unicampus_universities(id),
    course_code TEXT,
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    category TEXT NOT NULL CHECK (category IN ('Exam', 'CAT')),
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploader_name TEXT DEFAULT 'Anonymous',
    downloads INTEGER DEFAULT 0,
    previews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_unicampus_papers_university ON unicampus_papers(university_id);
CREATE INDEX IF NOT EXISTS idx_unicampus_papers_category ON unicampus_papers(category);
CREATE INDEX IF NOT EXISTS idx_unicampus_papers_year ON unicampus_papers(year);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE unicampus_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE unicampus_universities ENABLE ROW LEVEL SECURITY;

-- Universities: Anyone can read
CREATE POLICY "unicampus_universities_select"
    ON unicampus_universities FOR SELECT
    USING (true);

-- Papers: Anyone can read
CREATE POLICY "unicampus_papers_select"
    ON unicampus_papers FOR SELECT
    USING (true);

-- Papers: Authenticated users can insert
CREATE POLICY "unicampus_papers_insert"
    ON unicampus_papers FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Papers: Users can update their own papers
CREATE POLICY "unicampus_papers_update"
    ON unicampus_papers FOR UPDATE
    USING (auth.uid() = uploaded_by);

-- Papers: Users can delete their own papers
CREATE POLICY "unicampus_papers_delete"
    ON unicampus_papers FOR DELETE
    USING (auth.uid() = uploaded_by);

-- =============================================
-- Storage Bucket Configuration
-- Run this in the Supabase Dashboard SQL Editor
-- =============================================

-- Create storage bucket for papers (if not exists)
-- Note: This must be done via Supabase Dashboard or API
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'unicampus-papers',
--     'unicampus-papers',
--     true,
--     10485760,  -- 10MB in bytes
--     ARRAY['application/pdf']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- Storage Policies (run in Supabase Dashboard)
-- SELECT: Public access
-- CREATE POLICY "unicampus_storage_select"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'unicampus-papers');

-- INSERT: Authenticated users only
-- CREATE POLICY "unicampus_storage_insert"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'unicampus-papers' AND auth.uid() IS NOT NULL);

-- =============================================
-- Helper Functions
-- =============================================

-- Increment preview count
CREATE OR REPLACE FUNCTION increment_paper_preview(p_paper_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE unicampus_papers
    SET previews = previews + 1
    WHERE id = p_paper_id;
END;
$$;

-- Increment download count
CREATE OR REPLACE FUNCTION increment_paper_download(p_paper_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE unicampus_papers
    SET downloads = downloads + 1
    WHERE id = p_paper_id;
END;
$$;
