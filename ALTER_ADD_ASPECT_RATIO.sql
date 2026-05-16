-- Add aspect_ratio column to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS aspect_ratio DECIMAL(6,4);

-- Create index for better query performance if needed
CREATE INDEX IF NOT EXISTS notes_aspect_ratio_idx ON public.notes(aspect_ratio);

-- Add comment for documentation
COMMENT ON COLUMN public.notes.aspect_ratio IS 'Aspect ratio of the image (width/height), NULL if no image';
