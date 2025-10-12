# Database Migration Order for Staging Environment

Run these SQL files in your Supabase SQL Editor **in this exact order**:

## Migration Sequence

1. **create_family_member_requests_table.sql**
   - Creates family member requests table with RLS
   - Adds triggers for timestamp updates

2. **create_albums_table.sql**
   - Creates albums table for photo organization
   - Sets up RLS policies for album access

3. **create_event_invitations_table.sql**
   - Creates event invitation system
   - Links events to user invitations

4. **create_notifications_table_and_functions.sql**
   - Creates notifications table with indexes
   - Adds secure notification functions
   - Sets up RLS policies for notifications

5. **add_multi_admin_functions.sql**
   - Adds functions for multiple admin support
   - Creates admin notification system

6. **add_uid_fields_to_family_tree.sql**
   - Adds UID tracking to family tree
   - Links family members to auth users

7. **add_family_tree_uid_to_profiles.sql**
   - Links user profiles to family tree records
   - Adds family tree relationship tracking

8. **add_life_status_and_email_to_family_tree.sql**
   - Adds life status tracking (alive, deceased, unknown)
   - Adds email fields to family tree

9. **add_status_to_events.sql**
   - Adds status field to events table
   - Enables event approval workflow

10. **add_status_to_notice_boards.sql**
    - Adds status field to notice board posts
    - Enables notice board moderation

11. **add_album_id_to_galleries.sql**
    - Links gallery items to albums
    - Enables album-based photo organization

12. **add_onboarding_tracking_to_profiles.sql**
    - Adds onboarding progress tracking
    - Tracks user completion of setup steps

13. **add_has_seen_welcome_message_to_profiles.sql**
    - Adds welcome message display tracking
    - Prevents showing welcome message repeatedly

14. **update_family_member_requests_table.sql**
    - Updates family member requests structure
    - Adds additional fields for better tracking

15. **update_life_status_options.sql**
    - Updates life status enumeration options
    - Ensures consistent status values

## Quick Verification Queries

After running all migrations, use these queries to verify setup:

```sql
-- Check all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all required functions exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check RLS is enabled on main tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## Expected Results

### Required Tables:
- albums
- event_invitations  
- events
- family_member_requests
- family_tree
- galleries
- history
- life_events
- notice_boards
- notifications
- profiles

### Required Functions:
- create_admin_notifications
- create_system_notification
- create_system_notifications
- get_admin_user_ids
- set_updated_at
- update_notifications_updated_at

### RLS Enabled Tables:
All tables should have Row Level Security enabled for proper access control.
