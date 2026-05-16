-- Create Storage Bucket for Note Images
-- Run these commands in Supabase SQL Editor

-- 1. Create bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS Policies for Storage

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload images to their folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'note-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public to view images
CREATE POLICY "Public can view note images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'note-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'note-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- (Optional) For existing tables, add column if it doesn't exist:
-- ALTER TABLE public.notes ADD COLUMN image_url TEXT;
