-- Add status column to notice_boards table for approval system
-- This migration adds support for notice board approval workflow similar to gallery

-- Add status column with default value of 'pending'
ALTER TABLE notice_boards
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add user_id column to track who created the notice
ALTER TABLE notice_boards
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to have 'approved' status (for backward compatibility)
UPDATE notice_boards 
SET status = 'approved' 
WHERE status IS NULL;

-- Add index for performance on status queries
CREATE INDEX IF NOT EXISTS idx_notice_boards_status ON notice_boards(status);

-- Add index for user_id queries  
CREATE INDEX IF NOT EXISTS idx_notice_boards_user_id ON notice_boards(user_id);

-- Add created_at and updated_at columns if they don't exist
DO $$
BEGIN
    -- Add created_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notice_boards' AND column_name = 'created_at') THEN
        ALTER TABLE notice_boards ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notice_boards' AND column_name = 'updated_at') THEN
        ALTER TABLE notice_boards ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Update existing records to have timestamps
UPDATE notice_boards 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_notice_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS trigger_notice_boards_updated_at ON notice_boards;
CREATE TRIGGER trigger_notice_boards_updated_at
    BEFORE UPDATE ON notice_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_notice_boards_updated_at(); 