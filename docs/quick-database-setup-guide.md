# Quick Database Setup Guide for Staging

Follow these simple steps to set up your staging database.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your staging project: `jlmylfmswzjesnkczoum`
3. Click on "SQL Editor" in the left sidebar

## Step 2: Run the Complete Database Setup

1. Open the file: `docs/complete-database-setup.sql`
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** to execute the script

**That's it!** This single script will create:
- ✅ All 11 required tables
- ✅ All indexes and constraints  
- ✅ All 7+ required functions
- ✅ All triggers for automatic timestamps
- ✅ All RLS policies for security
- ✅ All foreign key relationships

## Step 3: Verify Setup (Optional)

1. Open the file: `docs/database-verification-queries.sql`
2. Copy the **entire contents** 
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** to verify everything is set up correctly

You should see:
- ✅ All required tables exist
- ✅ All required functions exist  
- ✅ RLS is enabled on all tables
- ✅ All indexes and constraints created

## Step 4: Create Storage Buckets

In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Create these 3 buckets:

### Bucket 1: `avatars`
- **Name**: `avatars`
- **Public**: ✅ Yes
- **File size limit**: 5MB
- **Allowed file types**: `image/*`

### Bucket 2: `gallery`
- **Name**: `gallery` 
- **Public**: ✅ Yes
- **File size limit**: 10MB
- **Allowed file types**: `image/*`

### Bucket 3: `documents`
- **Name**: `documents`
- **Public**: ❌ No (Private)
- **File size limit**: 20MB
- **Allowed file types**: `image/*, application/pdf`

## Step 5: Test Your Setup

1. Switch to your staging branch: `git checkout staging`
2. Copy environment file: `cp .env.staging .env.local`  
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open http://localhost:3000
6. Try to register a new user account

## You're Done! 🎉

Your staging environment is now fully set up with:
- Complete database schema
- All security policies
- Storage buckets configured
- Ready for testing

## If Something Goes Wrong

1. **Database errors**: Check that all SQL executed without errors
2. **Missing tables**: Re-run the `complete-database-setup.sql` script
3. **Storage errors**: Verify buckets are created with correct settings
4. **App errors**: Check that `.env.local` has correct staging credentials

## Files Overview

- **`complete-database-setup.sql`** - Single script to create everything
- **`database-verification-queries.sql`** - Verify setup is correct  
- **`staging-environment-setup.md`** - Detailed documentation
- **`staging-verification-checklist.md`** - Complete testing checklist

**Need help?** Check the detailed guides in the `docs/` folder!
