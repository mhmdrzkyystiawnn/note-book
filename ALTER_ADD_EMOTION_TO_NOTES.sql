-- Add emotion column to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS emotion VARCHAR(10) DEFAULT '😊';

-- Create index for better query performance if needed
CREATE INDEX IF NOT EXISTS notes_emotion_idx ON public.notes(emotion);
