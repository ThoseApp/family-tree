-- Add status and is_public columns to events table for publisher approval system
-- This migration adds support for event approval workflow and public event visibility

-- Add status column with default value of 'pending'
ALTER TABLE events
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add is_public column to control event visibility
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Update existing records to have 'approved' status (for backward compatibility)
UPDATE events 
SET status = 'approved' 
WHERE status IS NULL;

-- Add index for performance on status queries
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Add index for public events queries
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);

-- Add composite index for status and public events
CREATE INDEX IF NOT EXISTS idx_events_status_public ON events(status, is_public);

-- Ensure created_at and updated_at columns exist
DO $$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_at') THEN
        ALTER TABLE events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'updated_at') THEN
        ALTER TABLE events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Update existing records to have timestamps if they're null
UPDATE events 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at(); 