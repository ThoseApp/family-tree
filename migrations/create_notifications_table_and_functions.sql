-- Migration: Create notifications table and secure notification functions
-- Description: Create notifications table with RLS policies and functions for system notifications
-- Date: 2024-01-01


-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own notifications (for user-generated notifications)
CREATE POLICY "Users can create their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on notification updates
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Create secure function for system-generated notifications
-- This function runs with SECURITY DEFINER to bypass RLS restrictions
CREATE OR REPLACE FUNCTION create_system_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_body TEXT,
    p_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_image TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Validate that the target user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
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
        p_user_id,
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
    
    RETURN notification_id;
END;
$$;

-- Create function to create multiple system notifications at once
CREATE OR REPLACE FUNCTION create_system_notifications(
    notifications JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_data JSONB;
    created_count INTEGER := 0;
BEGIN
    -- Loop through each notification in the JSON array
    FOR notification_data IN SELECT * FROM jsonb_array_elements(notifications)
    LOOP
        -- Validate required fields
        IF NOT (notification_data ? 'user_id' AND notification_data ? 'title' AND notification_data ? 'body') THEN
            CONTINUE; -- Skip invalid notifications
        END IF;
        
        -- Create the notification
        PERFORM create_system_notification(
            (notification_data->>'user_id')::UUID,
            notification_data->>'title',
            notification_data->>'body',
            notification_data->>'type',
            CASE WHEN notification_data ? 'resource_id' 
                 THEN (notification_data->>'resource_id')::UUID 
                 ELSE NULL END,
            notification_data->>'image'
        );
        
        created_count := created_count + 1;
    END LOOP;
    
    RETURN created_count;
END;
$$;

-- Grant execute permissions on the functions to authenticated users
GRANT EXECUTE ON FUNCTION create_system_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_system_notifications TO authenticated; 