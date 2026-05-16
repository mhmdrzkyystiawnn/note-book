-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user_id for better query performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read their own notes
CREATE POLICY "Users can read their own notes"
  ON public.notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own notes
CREATE POLICY "Users can insert their own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to update their own notes
CREATE POLICY "Users can update their own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = user_id);
