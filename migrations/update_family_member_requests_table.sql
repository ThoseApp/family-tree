-- Migration: Update family_member_requests table to match family_tree structure
-- Description: Add missing columns to family_member_requests table to match family_tree table
-- Date: 2024-01-01

-- Add missing columns to match family_tree table structure

-- Add unique_id column (will be generated when request is approved)
ALTER TABLE family_member_requests 
ADD COLUMN IF NOT EXISTS unique_id VARCHAR(255);

-- Add UID columns for relationships
ALTER TABLE family_member_requests 
ADD COLUMN IF NOT EXISTS fathers_uid VARCHAR(255);

ALTER TABLE family_member_requests 
ADD COLUMN IF NOT EXISTS mothers_uid VARCHAR(255);

ALTER TABLE family_member_requests 
ADD COLUMN IF NOT EXISTS spouse_uid VARCHAR(255);

-- Add life_status column with check constraint
ALTER TABLE family_member_requests 
ADD COLUMN IF NOT EXISTS life_status VARCHAR(20) DEFAULT 'Alive' CHECK (life_status IN ('Alive', 'Deceased'));

-- Add email_address column
ALTER TABLE family_member_requests 
ADD COLUMN IF NOT EXISTS email_address VARCHAR(255);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_family_member_requests_fathers_uid ON family_member_requests(fathers_uid);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_mothers_uid ON family_member_requests(mothers_uid);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_spouse_uid ON family_member_requests(spouse_uid);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_life_status ON family_member_requests(life_status);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_email_address ON family_member_requests(email_address) WHERE email_address IS NOT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN family_member_requests.unique_id IS 'Unique identifier for the family member (generated when approved)';
COMMENT ON COLUMN family_member_requests.fathers_uid IS 'Reference to fathers unique_id in family-tree table';
COMMENT ON COLUMN family_member_requests.mothers_uid IS 'Reference to mothers unique_id in family-tree table';
COMMENT ON COLUMN family_member_requests.spouse_uid IS 'Reference to spouses unique_id in family-tree table';
COMMENT ON COLUMN family_member_requests.life_status IS 'Life status of the family member: Alive or Deceased';
COMMENT ON COLUMN family_member_requests.email_address IS 'Email address of the family member for account creation';
