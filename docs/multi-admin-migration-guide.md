# Multi-Admin Migration Guide

## Overview

This document outlines the migration from a single admin system (using `NEXT_PUBLIC_ADMIN_ID`) to a multiple admin system based on `user_metadata.is_admin` flag.

## Changes Made

### 1. New Multi-Admin Utility Functions

Created `/lib/utils/multi-admin-helpers.ts` with the following functions:

- `fetchAllAdminUsers()`: Fetches all users with `is_admin: true`
- `getAdminUserIds()`: Returns array of admin user IDs
- `isCurrentUserAdmin()`: Checks if current user is admin
- `getCurrentUserRole()`: Returns user role (admin/publisher/user)
- `createNotificationForAllAdmins()`: Sends notifications to all admins
- `canCurrentUserAutoApprove()`: Checks if user can auto-approve content
- `verifyAdminUserFromRequest()`: Server-side admin verification

### 2. Updated Stores

#### Events Store (`/stores/events-store.ts`)

- Replaced `NEXT_PUBLIC_ADMIN_ID` with `canCurrentUserAutoApprove()`
- Updated notification system to use `createNotificationForAllAdmins()`

#### Gallery Store (`/stores/gallery-store.ts`)

- Replaced `ADMIN_ID` constant with `canCurrentUserAutoApprove()`
- Updated notification system to use `createNotificationForAllAdmins()`

#### Notice Board Store (`/stores/notice-board-store.ts`)

- Replaced `ADMIN_ID` constant with `canCurrentUserAutoApprove()`
- Updated notification system to use `createNotificationForAllAdmins()`

### 3. Updated API Routes

#### Family Member Requests (`/app/api/family-member-requests/route.ts`)

- Added notification system to send alerts to all admins when new family member requests are created
- Uses `fetchAllAdminUsers()` to get all admin users

### 4. Database Migration

Created `/migrations/add_multi_admin_functions.sql`:

- Added `get_admin_user_ids()` function (for future server-side use)
- Added `create_admin_notifications()` function for bulk admin notifications

## How It Works

### Admin User Identification

- Users are identified as admins through `user_metadata.is_admin === true`
- This flag is set via the admin panel in User Accounts management
- Multiple users can have admin privileges simultaneously

### Notification System

- When content needs approval (events, gallery items, notice boards, family member requests)
- System fetches all admin users using `fetchAllAdminUsers()`
- Creates notifications for each admin using `create_system_notifications()` RPC function

### Auto-Approval Logic

- Content is auto-approved if created by admin or publisher users
- Uses `canCurrentUserAutoApprove()` to determine approval status
- Non-admin/publisher users' content goes to pending status

## Migration Benefits

1. **Scalability**: Support for multiple administrators
2. **Flexibility**: Easy to add/remove admin privileges
3. **Consistency**: All admin checks use the same `user_metadata.is_admin` pattern
4. **Reliability**: No dependency on environment variables for admin identification
5. **Security**: Server-side admin verification for API routes

## Testing Checklist

- [ ] Multiple users can be set as admins
- [ ] All admins receive notifications for pending content
- [ ] Admin users can auto-approve their own content
- [ ] Publisher users can auto-approve their own content
- [ ] Regular users' content goes to pending status
- [ ] Admin panel access works for all admin users
- [ ] API routes properly verify admin status

## Environment Variables

The following environment variable is no longer needed:

- `NEXT_PUBLIC_ADMIN_ID` ❌ (removed)

## Backward Compatibility

The system is fully backward compatible. Existing admin functionality continues to work, but now supports multiple admins instead of just one.

## Future Enhancements

1. Admin role hierarchy (super admin, admin, etc.)
2. Permission-based access control
3. Admin activity logging
4. Bulk admin operations

## Troubleshooting

### If admin notifications aren't working:

1. Check that users have `user_metadata.is_admin = true`
2. Verify `create_system_notifications` RPC function exists
3. Check server logs for notification creation errors

### If admin access is denied:

1. Verify user metadata in Supabase Auth dashboard
2. Check middleware is properly reading user metadata
3. Ensure admin routes are using correct verification functions
