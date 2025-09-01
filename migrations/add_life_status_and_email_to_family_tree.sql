-- Add life_status and email_address columns to family-tree table
-- This migration adds support for life status tracking and email addresses for family members

-- Add life_status column (default to 'Alive' for existing records)
ALTER TABLE "family-tree" 
ADD COLUMN life_status VARCHAR(20) DEFAULT 'Alive' CHECK (life_status IN ('Alive', 'Deceased'));

-- Add email_address column (optional field)
ALTER TABLE "family-tree" 
ADD COLUMN email_address VARCHAR(255);

-- Create index on email_address for faster lookups
CREATE INDEX idx_family_tree_email_address ON "family-tree"(email_address) WHERE email_address IS NOT NULL;

-- Create index on life_status for faster filtering
CREATE INDEX idx_family_tree_life_status ON "family-tree"(life_status);

-- Add comment to document the new columns
COMMENT ON COLUMN "family-tree".life_status IS 'Life status of the family member: Alive or Deceased';
COMMENT ON COLUMN "family-tree".email_address IS 'Email address of the family member for account creation';
