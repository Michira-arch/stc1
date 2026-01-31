-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    rating TEXT CHECK (rating IN ('good', 'neutral', 'bad')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT feedback_not_empty CHECK (rating IS NOT NULL OR (message IS NOT NULL AND message <> ''))
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (anon and authenticated) to insert feedback
CREATE POLICY "Allow public insert access"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Allow individual read access (if they are logged in)
CREATE POLICY "Allow individual read access"
ON public.feedback
FOR SELECT
TO public
USING (auth.uid() = user_id);
