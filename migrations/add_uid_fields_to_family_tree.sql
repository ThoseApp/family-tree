-- Migration: Add UID fields to family-tree table
-- Description: Add foreign key UID fields to establish proper relational links between family members
-- Date: 2024-01-01

-- Add fathers_uid column to store reference to father's unique_id
ALTER TABLE "family-tree" 
ADD COLUMN IF NOT EXISTS fathers_uid VARCHAR(255);

-- Add mothers_uid column to store reference to mother's unique_id
ALTER TABLE "family-tree" 
ADD COLUMN IF NOT EXISTS mothers_uid VARCHAR(255);

-- Add spouse_uid column to store reference to spouse's unique_id
ALTER TABLE "family-tree" 
ADD COLUMN IF NOT EXISTS spouse_uid VARCHAR(255);

-- Create indexes for better query performance on UID lookups
CREATE INDEX IF NOT EXISTS idx_family_tree_fathers_uid ON "family-tree"(fathers_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_mothers_uid ON "family-tree"(mothers_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_spouse_uid ON "family-tree"(spouse_uid);

-- Create composite indexes for family relationship queries
CREATE INDEX IF NOT EXISTS idx_family_tree_parent_uids ON "family-tree"(fathers_uid, mothers_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_unique_id_lookup ON "family-tree"(unique_id);

-- Note: Foreign key constraints can be added later if needed for referential integrity

-- Create a function to help populate the UID fields based on existing name fields
-- This can be used to migrate existing data by matching names to unique_ids
CREATE OR REPLACE FUNCTION populate_family_tree_uids()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER := 0;
    family_record RECORD;
BEGIN
    -- Loop through all family members and try to populate UID fields
    FOR family_record IN SELECT * FROM "family-tree"
    LOOP
        -- Update fathers_uid based on fathers_first_name and fathers_last_name
        IF family_record.fathers_first_name IS NOT NULL 
           AND family_record.fathers_last_name IS NOT NULL 
           AND family_record.fathers_uid IS NULL THEN
            
            UPDATE "family-tree" 
            SET fathers_uid = (
                SELECT unique_id 
                FROM "family-tree" ft 
                WHERE ft.first_name = family_record.fathers_first_name 
                  AND ft.last_name = family_record.fathers_last_name 
                LIMIT 1
            )
            WHERE unique_id = family_record.unique_id
              AND fathers_uid IS NULL;
            
            IF FOUND THEN
                updated_count := updated_count + 1;
            END IF;
        END IF;
        
        -- Update mothers_uid based on mothers_first_name and mothers_last_name
        IF family_record.mothers_first_name IS NOT NULL 
           AND family_record.mothers_last_name IS NOT NULL 
           AND family_record.mothers_uid IS NULL THEN
            
            UPDATE "family-tree" 
            SET mothers_uid = (
                SELECT unique_id 
                FROM "family-tree" ft 
                WHERE ft.first_name = family_record.mothers_first_name 
                  AND ft.last_name = family_record.mothers_last_name 
                LIMIT 1
            )
            WHERE unique_id = family_record.unique_id
              AND mothers_uid IS NULL;
            
            IF FOUND THEN
                updated_count := updated_count + 1;
            END IF;
        END IF;
        
        -- Update spouse_uid based on spouses_first_name and spouses_last_name
        IF family_record.spouses_first_name IS NOT NULL 
           AND family_record.spouses_last_name IS NOT NULL 
           AND family_record.spouse_uid IS NULL THEN
            
            UPDATE "family-tree" 
            SET spouse_uid = (
                SELECT unique_id 
                FROM "family-tree" ft 
                WHERE ft.first_name = family_record.spouses_first_name 
                  AND ft.last_name = family_record.spouses_last_name 
                LIMIT 1
            )
            WHERE unique_id = family_record.unique_id
              AND spouse_uid IS NULL;
            
            IF FOUND THEN
                updated_count := updated_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    RETURN updated_count;
END;
$$;

-- Note: You can run the following command to populate existing data:
-- SELECT populate_family_tree_uids(); 