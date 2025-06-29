# Notification System Fix

## Problem Description

The family tree application was experiencing a Row Level Security (RLS) policy violation when sending event invitations. The error was:

```
{
    "code": "42501",
    "details": null,
    "hint": null,
    "message": "new row violates row-level security policy for table \"notifications\""
}
```

## Root Cause

The issue occurred because:

1. **Event Invitation Flow**: When User A sends an invitation to User B, the system needs to create a notification for User B
2. **RLS Policy Restriction**: The notifications table had RLS policies that only allowed users to insert notifications where `auth.uid() = user_id`
3. **Authentication Mismatch**: User A (the inviter) was authenticated, but the system was trying to create a notification for User B (the invitee)
4. **Security Violation**: The RLS policy blocked this cross-user notification creation

## Solution Overview

The solution implements a **secure database function approach** that:

1. **Maintains Security**: Uses PostgreSQL's `SECURITY DEFINER` to safely bypass RLS restrictions
2. **Validates Users**: Ensures target users exist before creating notifications
3. **Preserves Permissions**: Only allows specific types of system-generated notifications
4. **Handles Bulk Operations**: Supports creating multiple notifications at once

## Implementation Details

### 1. Database Migration

Created `migrations/create_notifications_table_and_functions.sql` with:

- **Notifications Table**: Proper schema with indexes and constraints
- **RLS Policies**: Secure policies for user-specific operations
- **System Functions**: Two secure functions for notification creation

### 2. Secure Functions

#### `create_system_notification()`

- **Purpose**: Create individual system notifications
- **Security**: Runs with `SECURITY DEFINER` to bypass RLS
- **Validation**: Checks user existence before creation
- **Parameters**: All notification fields with proper typing

#### `create_system_notifications()`

- **Purpose**: Create multiple notifications in a single call
- **Input**: JSONB array of notification objects
- **Returns**: Count of successfully created notifications
- **Error Handling**: Skips invalid notifications, continues processing

### 3. Code Updates

#### Event Invitations Store

- **Before**: Direct table insert causing RLS violation
- **After**: Uses `create_system_notifications()` RPC call
- **Benefit**: Secure cross-user notification creation

#### Gallery Store

- **Before**: Direct table insert for admin notifications
- **After**: Uses `create_system_notification()` RPC call
- **Benefit**: Consistent notification creation pattern

#### Notifications Store

- **Updated**: `createNotification()` method uses secure function
- **Benefit**: All notification creation goes through secure pathway

## Security Considerations

### What's Protected

- **User Validation**: Functions verify target users exist
- **RLS Enforcement**: Regular user operations still respect RLS policies
- **Controlled Access**: Only authenticated users can call the functions
- **Input Validation**: Functions validate required fields

### What's Allowed

- **System Notifications**: Cross-user notifications for system events
- **Event Invitations**: Inviter can notify invitees
- **Admin Notifications**: Users can notify admin about requests
- **Response Notifications**: Invitees can notify inviters about responses

## Usage Examples

### Single Notification

```sql
SELECT create_system_notification(
    'user-uuid-here',
    'Event Invitation',
    'You have been invited to a family reunion',
    'event_invitation',
    'event-uuid-here',
    'https://example.com/event-image.jpg'
);
```

### Multiple Notifications

```sql
SELECT create_system_notifications(
    '[
        {
            "user_id": "user1-uuid",
            "title": "Event Invitation",
            "body": "You are invited to the reunion",
            "type": "event_invitation",
            "resource_id": "event-uuid"
        },
        {
            "user_id": "user2-uuid",
            "title": "Event Invitation",
            "body": "You are invited to the reunion",
            "type": "event_invitation",
            "resource_id": "event-uuid"
        }
    ]'::jsonb
);
```

### JavaScript/TypeScript Usage

```typescript
// Single notification
await supabase.rpc("create_system_notification", {
  p_user_id: "user-uuid",
  p_title: "Event Invitation",
  p_body: "You have been invited to an event",
  p_type: "event_invitation",
  p_resource_id: "event-uuid",
  p_image: "https://example.com/image.jpg",
});

// Multiple notifications
await supabase.rpc("create_system_notifications", {
  notifications: [
    {
      user_id: "user1-uuid",
      title: "Event Invitation",
      body: "You are invited",
      type: "event_invitation",
      resource_id: "event-uuid",
    },
    // ... more notifications
  ],
});
```

## Testing

### Verification Steps

1. **Deploy Migration**: Apply the database migration
2. **Test Invitations**: Send event invitations between users
3. **Check Notifications**: Verify notifications are created successfully
4. **Validate Security**: Ensure RLS policies still work for direct table access
5. **Test Gallery**: Upload gallery items as non-admin user
6. **Monitor Logs**: Check for any remaining RLS violations

### Expected Results

- ✅ Event invitations send successfully
- ✅ Notifications are created for invitees
- ✅ Gallery upload notifications work
- ✅ No RLS policy violations
- ✅ Real-time notifications still function
- ✅ User-specific notifications remain secure

## Rollback Plan

If issues occur, the migration can be rolled back:

```sql
-- Remove the functions
DROP FUNCTION IF EXISTS create_system_notification;
DROP FUNCTION IF EXISTS create_system_notifications;

-- Temporarily disable RLS for emergency fixes
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

Then revert the code changes to use direct table inserts with proper permissions.

## Future Enhancements

1. **Audit Logging**: Add logging to track system notification creation
2. **Rate Limiting**: Implement limits on notification creation frequency
3. **Notification Templates**: Create reusable notification templates
4. **Batch Processing**: Optimize for large-scale notification operations
5. **Delivery Tracking**: Track notification delivery and read status

## Conclusion

This solution provides a secure, scalable approach to cross-user notification creation while maintaining the security benefits of Row Level Security policies. The implementation is backward-compatible and doesn't affect existing notification functionality.
