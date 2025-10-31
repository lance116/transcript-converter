-- Supabase Schema for PreferenceSummarizer
-- Run this SQL in your Supabase SQL Editor to create the required table

-- Create transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transcript_text TEXT NOT NULL,
  preference_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at
ON public.transcripts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (optional - adjust based on your needs)
CREATE POLICY "Allow public read access"
ON public.transcripts
FOR SELECT
USING (true);

-- Create policy to allow public insert access (optional - adjust based on your needs)
CREATE POLICY "Allow public insert access"
ON public.transcripts
FOR INSERT
WITH CHECK (true);

-- Optional: Add a policy to prevent updates and deletes if you want immutable records
CREATE POLICY "Prevent updates"
ON public.transcripts
FOR UPDATE
USING (false);

CREATE POLICY "Prevent deletes"
ON public.transcripts
FOR DELETE
USING (false);

-- Add comments for documentation
COMMENT ON TABLE public.transcripts IS 'Stores Google Meet transcripts and their AI-generated preference summaries';
COMMENT ON COLUMN public.transcripts.id IS 'Unique identifier for each transcript analysis';
COMMENT ON COLUMN public.transcripts.transcript_text IS 'Raw Google Meet transcript text';
COMMENT ON COLUMN public.transcripts.preference_summary IS 'AI-generated customer preference summary';
COMMENT ON COLUMN public.transcripts.created_at IS 'Timestamp when the analysis was created';
