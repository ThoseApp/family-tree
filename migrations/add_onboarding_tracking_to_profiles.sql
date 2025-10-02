-- Migration: Add onboarding tour tracking to profiles table
-- Description: Add fields to track onboarding tour completion instead of using localStorage
-- Date: 2025-10-02

-- Add onboarding tour completion tracking column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding_tour BOOLEAN DEFAULT FALSE;

-- Add onboarding tour version tracking (for when we update the tour)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_tour_version VARCHAR(10) DEFAULT NULL;

-- Update existing users to false so they see the onboarding tour
UPDATE profiles 
SET has_completed_onboarding_tour = FALSE,
    onboarding_tour_version = NULL
WHERE has_completed_onboarding_tour IS NULL;

-- Add comments to columns for documentation
COMMENT ON COLUMN profiles.has_completed_onboarding_tour IS 'Tracks whether the user has completed the onboarding tour';
COMMENT ON COLUMN profiles.onboarding_tour_version IS 'Version of the onboarding tour the user has completed (e.g., "v1", "v2")';

-- Create index for faster lookups when checking onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_tour ON profiles(has_completed_onboarding_tour, onboarding_tour_version);
