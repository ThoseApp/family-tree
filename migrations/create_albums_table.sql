-- Migration: Create albums table
-- Description: Create table to store photo/video albums/folders for organizing gallery items
-- Date: 2024-01-01

CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_albums_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    
    -- Indexes for better performance
    CONSTRAINT albums_name_user_unique UNIQUE(name, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_name ON albums(name);

-- Enable Row Level Security (RLS)
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- RLS Policies for albums table
-- Users can only see their own albums
CREATE POLICY "Users can view their own albums" ON albums
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own albums
CREATE POLICY "Users can create their own albums" ON albums
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own albums
CREATE POLICY "Users can update their own albums" ON albums
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own albums
CREATE POLICY "Users can delete their own albums" ON albums
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_albums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on album updates
CREATE TRIGGER albums_updated_at_trigger
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_albums_updated_at();