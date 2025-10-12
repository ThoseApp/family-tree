-- ===================================================================
-- COMPLETE DATABASE SETUP FOR FAMILY TREE STAGING ENVIRONMENT
-- ===================================================================
-- This script creates all required tables, functions, triggers, and policies
-- Run this entire script in your Supabase SQL Editor
-- ===================================================================

-- ===================================================================
-- 1. CREATE CORE TABLES (Base tables that other tables reference)
-- ===================================================================

-- 1.1 Profiles Table (extends Supabase auth.users)
-- ===================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    picture_link TEXT,
    bio TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'publisher', 'admin')),
    family_tree_uid VARCHAR(255), -- Links to family-tree.unique_id
    has_completed_onboarding_tour BOOLEAN DEFAULT FALSE,
    onboarding_tour_version VARCHAR(10) DEFAULT NULL,
    has_seen_welcome_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_family_tree_uid ON profiles(family_tree_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_tour ON profiles(has_completed_onboarding_tour, onboarding_tour_version);

-- 1.2 Family Tree Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS "family-tree" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    picture_link TEXT,
    date_of_birth DATE,
    marital_status VARCHAR(100),
    fathers_first_name VARCHAR(100),
    fathers_last_name VARCHAR(100),
    mothers_first_name VARCHAR(100),
    mothers_last_name VARCHAR(100),
    spouses_first_name VARCHAR(100),
    spouses_last_name VARCHAR(100),
    fathers_uid VARCHAR(255), -- References another family-tree.unique_id
    mothers_uid VARCHAR(255), -- References another family-tree.unique_id
    spouse_uid VARCHAR(255),  -- References another family-tree.unique_id
    order_of_birth INTEGER,
    order_of_marriage INTEGER,
    life_status VARCHAR(20) DEFAULT 'Account Eligible' CHECK (life_status IN ('Deceased', 'Account Eligible', 'Child')),
    email_address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for family-tree
CREATE INDEX IF NOT EXISTS idx_family_tree_unique_id ON "family-tree"(unique_id);
CREATE INDEX IF NOT EXISTS idx_family_tree_fathers_uid ON "family-tree"(fathers_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_mothers_uid ON "family-tree"(mothers_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_spouse_uid ON "family-tree"(spouse_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_parent_uids ON "family-tree"(fathers_uid, mothers_uid);
CREATE INDEX IF NOT EXISTS idx_family_tree_life_status ON "family-tree"(life_status);
CREATE INDEX IF NOT EXISTS idx_family_tree_email_address ON "family-tree"(email_address) WHERE email_address IS NOT NULL;

-- 1.3 Events Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(255),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_status_public ON events(status, is_public);

-- 1.4 Galleries Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    album_id UUID, -- Will be linked to albums table
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for galleries
CREATE INDEX IF NOT EXISTS idx_galleries_user_id ON galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_galleries_album_id ON galleries(album_id);
CREATE INDEX IF NOT EXISTS idx_galleries_user_album ON galleries(user_id, album_id);
CREATE INDEX IF NOT EXISTS idx_galleries_status ON galleries(status);

-- 1.5 Notice Boards Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS notice_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notice_boards
CREATE INDEX IF NOT EXISTS idx_notice_boards_user_id ON notice_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_notice_boards_status ON notice_boards(status);

-- 1.6 Life Events Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS life_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_member_id VARCHAR(255) NOT NULL, -- References family-tree.unique_id
    event_type VARCHAR(100) NOT NULL,
    event_date DATE,
    description TEXT,
    location VARCHAR(255),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for life_events
CREATE INDEX IF NOT EXISTS idx_life_events_family_member_id ON life_events(family_member_id);
CREATE INDEX IF NOT EXISTS idx_life_events_user_id ON life_events(user_id);
CREATE INDEX IF NOT EXISTS idx_life_events_event_type ON life_events(event_type);
CREATE INDEX IF NOT EXISTS idx_life_events_event_date ON life_events(event_date);

-- 1.7 History Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date_occurred DATE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for history
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_date_occurred ON history(date_occurred);

-- ===================================================================
-- 2. CREATE TABLES FROM MIGRATIONS
-- ===================================================================

-- 2.1 Family Member Requests Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS family_member_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(255),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    picture_link TEXT,
    date_of_birth DATE,
    marital_status VARCHAR(100),
    fathers_first_name VARCHAR(50),
    fathers_last_name VARCHAR(50),
    mothers_first_name VARCHAR(50),
    mothers_last_name VARCHAR(50),
    spouses_first_name VARCHAR(50),
    spouses_last_name VARCHAR(50),
    fathers_uid VARCHAR(255),
    mothers_uid VARCHAR(255),
    spouse_uid VARCHAR(255),
    order_of_birth INTEGER,
    order_of_marriage INTEGER,
    life_status VARCHAR(20) DEFAULT 'Account Eligible' CHECK (life_status IN ('Deceased', 'Account Eligible', 'Child')),
    email_address VARCHAR(255),
    requested_by_user_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for family_member_requests
CREATE INDEX IF NOT EXISTS idx_family_member_requests_fathers_uid ON family_member_requests(fathers_uid);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_mothers_uid ON family_member_requests(mothers_uid);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_spouse_uid ON family_member_requests(spouse_uid);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_life_status ON family_member_requests(life_status);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_email_address ON family_member_requests(email_address) WHERE email_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_family_member_requests_status ON family_member_requests(status);
CREATE INDEX IF NOT EXISTS idx_family_member_requests_requested_by ON family_member_requests(requested_by_user_id);

-- 2.2 Albums Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT albums_name_user_unique UNIQUE(name, user_id)
);

-- Indexes for albums
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_name ON albums(name);

-- 2.3 Event Invitations Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS event_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_event_invitee UNIQUE(event_id, invitee_id),
    CONSTRAINT no_self_invitation CHECK (inviter_id != invitee_id)
);

-- Indexes for event_invitations
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id ON event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_inviter_id ON event_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_invitee_id ON event_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_event_invitations_created_at ON event_invitations(created_at DESC);

-- 2.4 Notifications Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50),
    resource_id UUID,
    image TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ===================================================================
-- 3. ADD FOREIGN KEY CONSTRAINTS
-- ===================================================================

-- Link galleries to albums
ALTER TABLE galleries 
ADD CONSTRAINT fk_galleries_album_id 
    FOREIGN KEY (album_id) 
    REFERENCES albums(id) 
    ON DELETE SET NULL;

-- ===================================================================
-- 4. CREATE TRIGGER FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- ===================================================================

-- Generic function for updating timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Specific functions for different tables
CREATE OR REPLACE FUNCTION update_albums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_event_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_notice_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ===================================================================

-- Profiles table triggers
DROP TRIGGER IF EXISTS handle_profiles_update ON profiles;
CREATE TRIGGER handle_profiles_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Family member requests table triggers
DROP TRIGGER IF EXISTS handle_family_member_requests_update ON family_member_requests;
CREATE TRIGGER handle_family_member_requests_update
    BEFORE UPDATE ON family_member_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Albums table triggers
DROP TRIGGER IF EXISTS albums_updated_at_trigger ON albums;
CREATE TRIGGER albums_updated_at_trigger
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_albums_updated_at();

-- Event invitations table triggers
DROP TRIGGER IF EXISTS trigger_update_event_invitations_updated_at ON event_invitations;
CREATE TRIGGER trigger_update_event_invitations_updated_at
    BEFORE UPDATE ON event_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_invitations_updated_at();

-- Notifications table triggers
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Events table triggers
DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at();

-- Notice boards table triggers
DROP TRIGGER IF EXISTS trigger_notice_boards_updated_at ON notice_boards;
CREATE TRIGGER trigger_notice_boards_updated_at
    BEFORE UPDATE ON notice_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_notice_boards_updated_at();

-- Family tree table triggers
DROP TRIGGER IF EXISTS trigger_family_tree_updated_at ON "family-tree";
CREATE TRIGGER trigger_family_tree_updated_at
    BEFORE UPDATE ON "family-tree"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Galleries table triggers
DROP TRIGGER IF EXISTS trigger_galleries_updated_at ON galleries;
CREATE TRIGGER trigger_galleries_updated_at
    BEFORE UPDATE ON galleries
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Life events table triggers
DROP TRIGGER IF EXISTS trigger_life_events_updated_at ON life_events;
CREATE TRIGGER trigger_life_events_updated_at
    BEFORE UPDATE ON life_events
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- History table triggers
DROP TRIGGER IF EXISTS trigger_history_updated_at ON history;
CREATE TRIGGER trigger_history_updated_at
    BEFORE UPDATE ON history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ===================================================================
-- 6. CREATE NOTIFICATION AND ADMIN FUNCTIONS
-- ===================================================================

-- Function to create system notifications
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

-- Function to create multiple system notifications
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

-- Function to get admin user IDs (placeholder for server-side use)
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
    RETURN ARRAY[]::UUID[];
END;
$$;

-- Function to create notifications for multiple admin users
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

-- Function to populate family tree UIDs from existing data
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

-- Function to link profiles to family tree records
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

-- ===================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family-tree" ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 8. CREATE RLS POLICIES
-- ===================================================================

-- 8.1 Profiles Table Policies
-- ===================================================================

-- Users can view their own profile and other approved profiles
CREATE POLICY "Users can view profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        status = 'approved'
    );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Only system can insert profiles (handled by middleware)
CREATE POLICY "System can create profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- 8.2 Family Tree Table Policies
-- ===================================================================

-- Users can view all family tree records (family is shared)
CREATE POLICY "Users can view family tree" ON "family-tree"
    FOR SELECT TO authenticated USING (true);

-- Only admins can modify family tree (add more restrictive policy as needed)
CREATE POLICY "Admins can modify family tree" ON "family-tree"
    FOR ALL TO authenticated USING (true);

-- 8.3 Family Member Requests Table Policies
-- ===================================================================

-- Admin can see all requests
CREATE POLICY "Admin can see all requests" ON family_member_requests
    FOR SELECT TO authenticated USING (true);

-- Users can see their own requests
CREATE POLICY "Users can see their own requests" ON family_member_requests
    FOR SELECT TO authenticated USING (requested_by_user_id = auth.uid());

-- Users can insert new requests
CREATE POLICY "Users can insert their own requests" ON family_member_requests
    FOR INSERT TO authenticated WITH CHECK (requested_by_user_id = auth.uid());

-- Admin can update requests (to change status)
CREATE POLICY "Admin can update requests" ON family_member_requests
    FOR UPDATE TO authenticated USING (true);

-- 8.4 Albums Table Policies
-- ===================================================================

-- Users can view their own albums
CREATE POLICY "Users can view their own albums" ON albums
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own albums
CREATE POLICY "Users can create their own albums" ON albums
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own albums
CREATE POLICY "Users can update their own albums" ON albums
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own albums
CREATE POLICY "Users can delete their own albums" ON albums
    FOR DELETE USING (auth.uid() = user_id);

-- 8.5 Galleries Table Policies
-- ===================================================================

-- Users can view their own galleries or galleries in their albums
CREATE POLICY "Users can view their own galleries" ON galleries
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (album_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM albums 
            WHERE albums.id = galleries.album_id 
            AND albums.user_id = auth.uid()
        ))
    );

-- Users can insert galleries into their own albums
CREATE POLICY "Users can insert their own galleries" ON galleries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            album_id IS NULL OR EXISTS (
                SELECT 1 FROM albums 
                WHERE albums.id = galleries.album_id 
                AND albums.user_id = auth.uid()
            )
        )
    );

-- Users can update their own galleries
CREATE POLICY "Users can update their own galleries" ON galleries
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND (
            album_id IS NULL OR EXISTS (
                SELECT 1 FROM albums 
                WHERE albums.id = galleries.album_id 
                AND albums.user_id = auth.uid()
            )
        )
    );

-- Users can delete their own galleries
CREATE POLICY "Users can delete their own galleries" ON galleries
    FOR DELETE USING (auth.uid() = user_id);

-- 8.6 Events Table Policies
-- ===================================================================

-- Users can view approved events or their own events
CREATE POLICY "Users can view events" ON events
    FOR SELECT USING (
        status = 'approved' OR 
        auth.uid() = user_id
    );

-- Users can create their own events
CREATE POLICY "Users can create their own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- 8.7 Event Invitations Table Policies
-- ===================================================================

-- Users can view invitations they sent or received
CREATE POLICY "Users can view their own invitations" ON event_invitations
    FOR SELECT USING (
        auth.uid() = inviter_id OR 
        auth.uid() = invitee_id
    );

-- Users can create invitations for events they own
CREATE POLICY "Users can create invitations for their events" ON event_invitations
    FOR INSERT WITH CHECK (
        auth.uid() = inviter_id AND
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_invitations.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- Users can update invitations they received or sent
CREATE POLICY "Users can update their invitations" ON event_invitations
    FOR UPDATE USING (
        auth.uid() = inviter_id OR 
        auth.uid() = invitee_id
    );

-- Users can delete invitations they sent
CREATE POLICY "Users can delete invitations they sent" ON event_invitations
    FOR DELETE USING (auth.uid() = inviter_id);

-- 8.8 Notice Boards Table Policies
-- ===================================================================

-- Users can view approved notice boards or their own
CREATE POLICY "Users can view notice boards" ON notice_boards
    FOR SELECT USING (
        status = 'approved' OR 
        auth.uid() = user_id
    );

-- Users can create their own notice boards
CREATE POLICY "Users can create their own notice boards" ON notice_boards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notice boards
CREATE POLICY "Users can update their own notice boards" ON notice_boards
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notice boards
CREATE POLICY "Users can delete their own notice boards" ON notice_boards
    FOR DELETE USING (auth.uid() = user_id);

-- 8.9 Notifications Table Policies
-- ===================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own notifications (for user-generated notifications)
CREATE POLICY "Users can create their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- 8.10 Life Events Table Policies
-- ===================================================================

-- Users can view all life events (family shared content)
CREATE POLICY "Users can view life events" ON life_events
    FOR SELECT TO authenticated USING (true);

-- Users can create life events
CREATE POLICY "Users can create life events" ON life_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own life events
CREATE POLICY "Users can update their own life events" ON life_events
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own life events
CREATE POLICY "Users can delete their own life events" ON life_events
    FOR DELETE USING (auth.uid() = user_id);

-- 8.11 History Table Policies
-- ===================================================================

-- Users can view all history records (family shared content)
CREATE POLICY "Users can view history" ON history
    FOR SELECT TO authenticated USING (true);

-- Users can create history records
CREATE POLICY "Users can create history" ON history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own history records
CREATE POLICY "Users can update their own history" ON history
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own history records
CREATE POLICY "Users can delete their own history" ON history
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- 9. GRANT FUNCTION PERMISSIONS
-- ===================================================================

GRANT EXECUTE ON FUNCTION create_system_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_system_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_ids TO authenticated;
GRANT EXECUTE ON FUNCTION populate_family_tree_uids TO authenticated;
GRANT EXECUTE ON FUNCTION link_profiles_to_family_tree TO authenticated;

-- ===================================================================
-- 10. ADD COLUMN COMMENTS FOR DOCUMENTATION
-- ===================================================================

-- Profiles table comments
COMMENT ON COLUMN profiles.has_completed_onboarding_tour IS 'Tracks whether the user has completed the onboarding tour';
COMMENT ON COLUMN profiles.onboarding_tour_version IS 'Version of the onboarding tour the user has completed (e.g., "v1", "v2")';
COMMENT ON COLUMN profiles.has_seen_welcome_message IS 'Tracks whether the user has seen the welcome message popup on first sign-in';
COMMENT ON COLUMN profiles.family_tree_uid IS 'Links to family-tree.unique_id to connect user accounts with family members';

-- Family tree table comments
COMMENT ON COLUMN "family-tree".life_status IS 'Life status of the family member: Deceased, Account Eligible, or Child. Only Account Eligible members can have accounts created.';
COMMENT ON COLUMN "family-tree".email_address IS 'Email address of the family member for account creation';

-- Family member requests table comments
COMMENT ON COLUMN family_member_requests.unique_id IS 'Unique identifier for the family member (generated when approved)';
COMMENT ON COLUMN family_member_requests.fathers_uid IS 'Reference to fathers unique_id in family-tree table';
COMMENT ON COLUMN family_member_requests.mothers_uid IS 'Reference to mothers unique_id in family-tree table';
COMMENT ON COLUMN family_member_requests.spouse_uid IS 'Reference to spouses unique_id in family-tree table';
COMMENT ON COLUMN family_member_requests.life_status IS 'Life status of the family member: Deceased, Account Eligible, or Child. Only Account Eligible members can have accounts created.';
COMMENT ON COLUMN family_member_requests.email_address IS 'Email address of the family member for account creation';

-- Function comments
COMMENT ON FUNCTION get_admin_user_ids() IS 'Returns array of admin user IDs - requires server-side admin client access';
COMMENT ON FUNCTION create_admin_notifications(VARCHAR, TEXT, VARCHAR, UUID, TEXT, UUID[]) IS 'Creates notifications for multiple admin users';

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'All tables, functions, triggers, and policies have been created.';
    RAISE NOTICE 'You can now run verification queries to ensure everything is set up correctly.';
    RAISE NOTICE '=================================================================';
END $$;
