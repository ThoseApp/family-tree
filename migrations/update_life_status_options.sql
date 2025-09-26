-- Migration: Update life_status options to include three statuses
-- Description: Change life_status from (Alive, Deceased) to (Deceased, Account Eligible, Child)
-- Date: 2024-09-26

-- First, update existing 'Alive' records to 'Account Eligible'
UPDATE "family-tree" 
SET life_status = 'Account Eligible' 
WHERE life_status = 'Alive';

-- Update family_member_requests table as well
UPDATE family_member_requests 
SET life_status = 'Account Eligible' 
WHERE life_status = 'Alive';

-- Drop the existing check constraint on family-tree table
ALTER TABLE "family-tree" 
DROP CONSTRAINT IF EXISTS family_tree_life_status_check;

-- Add new check constraint with three options
ALTER TABLE "family-tree" 
ADD CONSTRAINT family_tree_life_status_check 
CHECK (life_status IN ('Deceased', 'Account Eligible', 'Child'));

-- Drop the existing check constraint on family_member_requests table
ALTER TABLE family_member_requests 
DROP CONSTRAINT IF EXISTS family_member_requests_life_status_check;

-- Add new check constraint with three options for family_member_requests
ALTER TABLE family_member_requests 
ADD CONSTRAINT family_member_requests_life_status_check 
CHECK (life_status IN ('Deceased', 'Account Eligible', 'Child'));

-- Update the default value for new records to 'Account Eligible'
ALTER TABLE "family-tree" 
ALTER COLUMN life_status SET DEFAULT 'Account Eligible';

ALTER TABLE family_member_requests 
ALTER COLUMN life_status SET DEFAULT 'Account Eligible';

-- Update the column comments to reflect the new options
COMMENT ON COLUMN "family-tree".life_status IS 'Life status of the family member: Deceased, Account Eligible, or Child. Only Account Eligible members can have accounts created.';

COMMENT ON COLUMN family_member_requests.life_status IS 'Life status of the family member: Deceased, Account Eligible, or Child. Only Account Eligible members can have accounts created.';
