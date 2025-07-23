-- Migration: Add family_tree_uid to profiles table
-- Description: Add foreign key column to link user profiles to family-tree records
-- Date: 2024-01-01

-- Add family_tree_uid column to profiles table (nullable since existing users may not have family tree records)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS family_tree_uid VARCHAR(255);

-- Create index for better query performance when looking up users by family tree ID
CREATE INDEX IF NOT EXISTS idx_profiles_family_tree_uid ON profiles(family_tree_uid);

-- Create unique constraint to ensure one user account per family member (optional - can be removed if family members can have multiple accounts)
-- ALTER TABLE profiles 
-- ADD CONSTRAINT IF NOT EXISTS unique_family_tree_uid UNIQUE(family_tree_uid);

-- Add foreign key constraint to family-tree table (optional - depends on your referential integrity needs)
-- Note: This would require family-tree.unique_id to be a primary key or have a unique constraint
-- ALTER TABLE profiles 
-- ADD CONSTRAINT IF NOT EXISTS fk_profiles_family_tree_uid 
--     FOREIGN KEY (family_tree_uid) 
--     REFERENCES "family-tree"(unique_id) 
--     ON DELETE SET NULL;

-- Create function to help link existing users to family tree records based on name matching
CREATE OR REPLACE FUNCTION link_profiles_to_family_tree()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER := 0;
    profile_record RECORD;
BEGIN
    -- Loop through all profiles that don't have a family_tree_uid
    FOR profile_record IN 
        SELECT user_id, first_name, last_name 
        FROM profiles 
        WHERE family_tree_uid IS NULL
    LOOP
        -- Try to find matching family tree record
        UPDATE profiles 
        SET family_tree_uid = (
            SELECT unique_id 
            FROM "family-tree" ft 
            WHERE LOWER(TRIM(ft.first_name)) = LOWER(TRIM(profile_record.first_name))
              AND LOWER(TRIM(ft.last_name)) = LOWER(TRIM(profile_record.last_name))
            LIMIT 1
        )
        WHERE user_id = profile_record.user_id
          AND family_tree_uid IS NULL;
        
        IF FOUND THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;
    
    RETURN updated_count;
END;
$$;

-- Note: You can run the following command to automatically link existing profiles to family tree records:
-- SELECT link_profiles_to_family_tree(); 