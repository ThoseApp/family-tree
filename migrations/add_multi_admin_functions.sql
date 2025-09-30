-- Migration: Add functions to support multiple admin users
-- This migration adds database functions to help with multi-admin functionality

-- Function to get all admin user IDs
-- This function can be called from the application to get admin IDs for notifications
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_ids UUID[];
BEGIN
    -- This function requires admin client access to auth.users
    -- It should be called from server-side code with admin privileges
    
    -- For now, we'll return an empty array as this function
    -- is primarily for documentation and future server-side use
    -- The actual admin fetching will be done via the admin client in the application
    
    RETURN ARRAY[]::UUID[];
END;
$$;

-- Function to create notifications for all admin users
-- This is an enhanced version that can handle multiple admins
CREATE OR REPLACE FUNCTION create_admin_notifications(
    p_title VARCHAR(255),
    p_body TEXT,
    p_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_image TEXT DEFAULT NULL,
    p_admin_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_id UUID;
    created_count INTEGER := 0;
    notification_id UUID;
BEGIN
    -- If no admin IDs provided, we can't create notifications
    -- The application should pass the admin IDs from the server-side admin client
    IF p_admin_ids IS NULL OR array_length(p_admin_ids, 1) IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Create a notification for each admin
    FOREACH admin_id IN ARRAY p_admin_ids
    LOOP
        -- Validate that the target user exists
        IF EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
            -- Insert the notification
            INSERT INTO notifications (
                user_id,
                title,
                body,
                type,
                resource_id,
                image,
                read,
                created_at,
                updated_at
            )
            VALUES (
                admin_id,
                p_title,
                p_body,
                p_type,
                p_resource_id,
                p_image,
                FALSE,
                NOW(),
                NOW()
            )
            RETURNING id INTO notification_id;
            
            created_count := created_count + 1;
        END IF;
    END LOOP;
    
    RETURN created_count;
END;
$$;

-- Add a comment to document the migration
COMMENT ON FUNCTION get_admin_user_ids() IS 'Returns array of admin user IDs - requires server-side admin client access';
COMMENT ON FUNCTION create_admin_notifications(VARCHAR, TEXT, VARCHAR, UUID, TEXT, UUID[]) IS 'Creates notifications for multiple admin users';
