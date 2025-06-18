-- Migration: Add album_id to galleries table
-- Description: Add foreign key column to link gallery items to albums
-- Date: 2024-01-01

-- Add album_id column to galleries table (nullable to allow unorganized items)
ALTER TABLE galleries 
ADD COLUMN IF NOT EXISTS album_id UUID;

-- Add foreign key constraint to link galleries to albums
ALTER TABLE galleries 
ADD CONSTRAINT IF NOT EXISTS fk_galleries_album_id 
    FOREIGN KEY (album_id) 
    REFERENCES albums(id) 
    ON DELETE SET NULL;

-- Create index for better query performance when filtering by album
CREATE INDEX IF NOT EXISTS idx_galleries_album_id ON galleries(album_id);

-- Create composite index for user_id and album_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_galleries_user_album ON galleries(user_id, album_id);

-- Update RLS policies for galleries table to handle album access
-- Note: This assumes you already have RLS enabled on galleries table
-- If you need to add RLS policies for the first time, uncomment the following:

-- ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

-- Create or replace existing policies to handle album-based access
-- Users can view galleries in their albums or unorganized galleries
DROP POLICY IF EXISTS "Users can view their own galleries" ON galleries;
CREATE POLICY "Users can view their own galleries" ON galleries
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (album_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM albums 
            WHERE albums.id = galleries.album_id 
            AND albums.user_id = auth.uid()
        ))
    );

-- Users can insert galleries into their own albums or as unorganized
DROP POLICY IF EXISTS "Users can insert their own galleries" ON galleries;
CREATE POLICY "Users can insert their own galleries" ON galleries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            album_id IS NULL OR EXISTS (
                SELECT 1 FROM albums 
                WHERE albums.id = galleries.album_id 
                AND albums.user_id = auth.uid()
            )
        )
    );

-- Users can update their own galleries and change album associations within their albums
DROP POLICY IF EXISTS "Users can update their own galleries" ON galleries;
CREATE POLICY "Users can update their own galleries" ON galleries
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND (
            album_id IS NULL OR EXISTS (
                SELECT 1 FROM albums 
                WHERE albums.id = galleries.album_id 
                AND albums.user_id = auth.uid()
            )
        )
    );

-- Users can delete their own galleries
DROP POLICY IF EXISTS "Users can delete their own galleries" ON galleries;
CREATE POLICY "Users can delete their own galleries" ON galleries
    FOR DELETE USING (auth.uid() = user_id); 