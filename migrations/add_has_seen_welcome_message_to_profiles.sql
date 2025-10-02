-- Migration: Add has_seen_welcome_message to profiles table
-- Description: Add boolean field to track if user has seen the welcome message popup
-- Date: 2025-10-02

-- Add has_seen_welcome_message column to profiles table (defaults to false for new users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_seen_welcome_message BOOLEAN DEFAULT FALSE;

-- Update existing users to false so they see the welcome message
UPDATE profiles 
SET has_seen_welcome_message = FALSE 
WHERE has_seen_welcome_message IS NULL;

-- Add comment to column for documentation
COMMENT ON COLUMN profiles.has_seen_welcome_message IS 'Tracks whether the user has seen the welcome message popup on first sign-in';


