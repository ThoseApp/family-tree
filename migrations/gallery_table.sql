-- Create a table for storing gallery images
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view all gallery images
CREATE POLICY "Gallery images are viewable by everyone" 
  ON galleries 
  FOR SELECT 
  USING (true);

-- Create a policy that allows authenticated users to insert their own images
CREATE POLICY "Users can insert their own gallery images" 
  ON galleries 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own images
CREATE POLICY "Users can update their own gallery images" 
  ON galleries 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own images
CREATE POLICY "Users can delete their own gallery images" 
  ON galleries 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create a storage bucket for gallery images if it doesn't exist
-- Note: This will use the existing bucket configuration if already set up
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the gallery bucket
CREATE POLICY "Authenticated users can upload images" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'gallery');

-- Allow public access to read gallery images
CREATE POLICY "Gallery images are publicly accessible" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'gallery');

-- Allow users to update their own gallery images
CREATE POLICY "Users can update their own gallery images" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'gallery' AND owner = auth.uid());

-- Allow users to delete their own gallery images
CREATE POLICY "Users can delete their own gallery images" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'gallery' AND owner = auth.uid()); 