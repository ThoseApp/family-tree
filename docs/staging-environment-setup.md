# Staging Environment Setup Guide

This guide walks you through setting up a complete staging environment for the Family Tree platform using a separate Supabase project.

## Overview

The staging environment uses:
- **Staging Branch**: `staging`
- **Staging Supabase Project**: `https://jlmylfmswzjesnkczoum.supabase.co`
- **Environment File**: `.env.staging`

## Prerequisites

- Access to Supabase dashboard for the staging project
- Admin access to create tables and run SQL migrations
- Node.js and npm/yarn installed locally

## Step 1: Branch Setup

The staging branch has already been created from the current state of the project.

```bash
# Switch to staging branch
git checkout staging

# Verify you're on the staging branch
git branch
```

## Step 2: Environment Configuration

### 2.1 Environment Variables

The `.env.staging` file has been created with the following configuration:

```env
# Staging Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://jlmylfmswzjesnkczoum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbXlsZm1zd3pqZXNua2N6b3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjY5MjIsImV4cCI6MjA3NTg0MjkyMn0.AtEIwqUPMFG30NlnR9QlZhMpzdQIVuyafH2EuoW_O8I
```

**Important**: Copy any additional environment variables from your production `.env.local` file (like API keys for email, authentication providers, etc.)

### 2.2 Next.js Configuration

The `next.config.mjs` has been updated to include the staging Supabase hostname for image optimization:

```javascript
{
  protocol: "https",
  hostname: "jlmylfmswzjesnkczoum.supabase.co",
},
```

## Step 3: Database Setup

### 3.1 Required Tables and Core Schema

Before running migrations, ensure the following core tables exist in your Supabase project:

#### Core Tables (should exist by default or be created first):

1. **profiles** - User profiles table
2. **users** - References `auth.users` (Supabase default)

#### Application Tables (created via migrations):

The following tables will be created through the migration files:

1. **notifications** - System notifications
2. **family_member_requests** - Family member addition requests
3. **albums** - Photo albums
4. **galleries** - Gallery items
5. **events** - Family events
6. **event_invitations** - Event invitation system
7. **notice_boards** - Notice board posts
8. **family_tree** - Family tree structure
9. **life_events** - Life events tracking
10. **history** - Family history records

### 3.2 Apply Database Migrations

Run the following SQL migrations in your Supabase SQL Editor **in this exact order**:

#### Migration 1: Core Tables
```sql
-- File: migrations/create_family_member_requests_table.sql
-- Creates the family member requests table with RLS policies
```

#### Migration 2: Albums System
```sql
-- File: migrations/create_albums_table.sql
-- Creates albums table for photo organization
```

#### Migration 3: Event Invitations
```sql
-- File: migrations/create_event_invitations_table.sql
-- Creates event invitation system
```

#### Migration 4: Notifications System
```sql
-- File: migrations/create_notifications_table_and_functions.sql
-- Creates notifications table with secure functions
```

#### Migration 5: Multi-Admin Support
```sql
-- File: migrations/add_multi_admin_functions.sql
-- Adds functions for multiple admin users
```

#### Migration 6: Family Tree Enhancements
```sql
-- File: migrations/add_uid_fields_to_family_tree.sql
-- Adds UID fields to family tree table
```

#### Migration 7: Profile Enhancements
```sql
-- File: migrations/add_family_tree_uid_to_profiles.sql
-- Links profiles to family tree
```

#### Migration 8: Life Status Updates
```sql
-- File: migrations/add_life_status_and_email_to_family_tree.sql
-- Adds life status tracking
```

#### Migration 9: Status Fields
```sql
-- File: migrations/add_status_to_events.sql
-- Adds status field to events
```

#### Migration 10: Notice Board Status
```sql
-- File: migrations/add_status_to_notice_boards.sql
-- Adds status field to notice boards
```

#### Migration 11: Gallery Albums
```sql
-- File: migrations/add_album_id_to_galleries.sql
-- Links galleries to albums
```

#### Migration 12: Onboarding Tracking
```sql
-- File: migrations/add_onboarding_tracking_to_profiles.sql
-- Adds onboarding progress tracking
```

#### Migration 13: Welcome Message
```sql
-- File: migrations/add_has_seen_welcome_message_to_profiles.sql
-- Adds welcome message tracking
```

#### Migration 14: Family Member Requests Update
```sql
-- File: migrations/update_family_member_requests_table.sql
-- Updates family member requests structure
```

#### Migration 15: Life Status Options
```sql
-- File: migrations/update_life_status_options.sql
-- Updates life status enumeration
```

### 3.3 Manual Migration Process

For each migration file in the `migrations/` folder:

1. Open the file in your code editor
2. Copy the entire SQL content
3. Go to your Supabase dashboard → SQL Editor
4. Paste the SQL content
5. Run the migration
6. Verify no errors occurred
7. Check that new tables/functions were created

### 3.4 Verify Database Setup

After running all migrations, verify the following:

#### Tables Check:
- [ ] `profiles` table exists
- [ ] `notifications` table exists  
- [ ] `family_member_requests` table exists
- [ ] `albums` table exists
- [ ] `galleries` table exists
- [ ] `events` table exists
- [ ] `event_invitations` table exists
- [ ] `notice_boards` table exists
- [ ] `family_tree` table exists

#### Functions Check:
- [ ] `create_system_notification()` function exists
- [ ] `create_system_notifications()` function exists
- [ ] `create_admin_notifications()` function exists
- [ ] `get_admin_user_ids()` function exists

#### RLS Policies Check:
- [ ] All tables have Row Level Security enabled
- [ ] Policies exist for user access control
- [ ] Admin policies are properly configured

## Step 4: Storage Configuration

### 4.1 Create Storage Buckets

In your Supabase dashboard, go to Storage and create the following buckets:

1. **avatars** - For user profile pictures
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: image/*

2. **gallery** - For family photos
   - Public: Yes  
   - File size limit: 10MB
   - Allowed MIME types: image/*

3. **documents** - For family documents
   - Public: No
   - File size limit: 20MB
   - Allowed MIME types: application/pdf, image/*

### 4.2 Storage Policies

For each bucket, set up appropriate RLS policies:

```sql
-- Example for avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

## Step 5: Authentication Setup

### 5.1 Configure Auth Providers

If you're using external auth providers (Google, etc.), configure them in:
1. Supabase Dashboard → Authentication → Providers
2. Add the same providers configured in production
3. Update redirect URLs to match your staging domain

### 5.2 Email Templates

Configure email templates in:
1. Supabase Dashboard → Authentication → Email Templates
2. Copy settings from production or customize for staging

## Step 6: Running the Staging Environment

### 6.1 Development Mode

```bash
# Make sure you're on staging branch
git checkout staging

# Install dependencies (if needed)
npm install

# Run with staging environment
cp .env.staging .env.local
npm run dev
```

### 6.2 Build and Deploy

```bash
# Build the application
npm run build

# Test the build locally
npm run start
```

## Step 7: Verification Checklist

After setup, verify the following features work:

### Authentication
- [ ] User registration works
- [ ] User login works  
- [ ] Password reset works
- [ ] Profile creation on first login

### Core Features
- [ ] Family tree visualization loads
- [ ] Family member requests can be created
- [ ] Admin can approve/reject requests
- [ ] Photo galleries work
- [ ] Events system functions
- [ ] Notice board works
- [ ] Notifications system works

### Admin Features
- [ ] Admin dashboard accessible
- [ ] User management works
- [ ] Multi-admin notifications work
- [ ] Role-based access control functions

### File Uploads
- [ ] Profile picture uploads work
- [ ] Gallery photo uploads work
- [ ] File storage permissions correct

## Step 8: Data Migration (Optional)

If you need to migrate data from production to staging for testing:

1. Export data from production Supabase
2. Clean/anonymize sensitive data
3. Import to staging environment
4. Verify data integrity

## Troubleshooting

### Common Issues:

1. **Migration Errors**: 
   - Check if tables already exist
   - Verify column names and types
   - Check for foreign key constraints

2. **Authentication Issues**:
   - Verify environment variables are correct
   - Check auth provider configurations
   - Verify redirect URLs

3. **Storage Issues**:
   - Check bucket permissions
   - Verify CORS settings
   - Check file size limits

4. **Function Errors**:
   - Verify all functions were created
   - Check function permissions
   - Test functions in SQL editor

## Maintenance

### Keeping Staging Updated

1. Regularly merge changes from main branch
2. Apply new migrations as they're created
3. Keep environment variables in sync
4. Monitor for deprecated features

### Branch Management

```bash
# Update staging with latest changes
git checkout staging
git merge main  # or your main branch name

# Push changes to remote
git push origin staging
```

## Security Notes

- Never use production API keys in staging
- Use separate auth providers for staging if possible
- Regularly clean up test data
- Monitor access logs
- Keep staging data anonymized

---

**Setup Complete!** Your staging environment should now be fully functional and isolated from production.
