# Real-time Count Badge Fix

## Problem Identified

The count badges in the sidebar were not updating automatically when gallery requests (and other content) were approved or declined. The issue was with the real-time subscription filters.

## Root Cause

The original real-time subscriptions were filtering for only items with `status=eq.pending`:

```typescript
// ❌ PROBLEMATIC - Only listens to pending items
filter: `status=eq.${GalleryStatusEnum.pending}`;
```

**The Problem**: When an item's status changes from "pending" to "approved", the subscription doesn't catch this change because:

1. The item WAS pending (subscription was listening)
2. The item becomes approved (subscription stops listening)
3. The status change event is missed because the new status is not "pending"

## Solution Implemented

### 1. Removed Status Filters

Changed subscriptions to listen to **ALL** changes on the relevant tables:

```typescript
// ✅ FIXED - Listens to all changes
{
  event: "*",
  schema: "public",
  table: "galleries",
  // No filter - catches all status changes
}
```

### 2. Added Debouncing

Implemented debounced updates to prevent excessive API calls:

```typescript
const debouncedFetchCounts = useCallback(() => {
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }

  debounceTimeoutRef.current = setTimeout(() => {
    fetchCounts();
  }, 300); // 300ms debounce
}, []);
```

### 3. Enhanced Logging

Added console logging to track real-time changes:

```typescript
(payload) => {
  console.log("Gallery change detected:", payload);
  debouncedFetchCounts();
};
```

### 4. Created Test Utilities

Added testing functions to verify real-time functionality:

- `testGalleryCountUpdate()` - Creates, approves, and deletes test items
- `testRealtimeSubscription()` - Tests subscription connectivity

## Files Modified

1. **`/hooks/use-pending-counts.ts`**:

   - Removed status filters from all subscriptions
   - Added debouncing mechanism
   - Enhanced error handling and logging
   - Improved cleanup logic

2. **`/lib/utils/test-realtime-counts.ts`** (NEW):

   - Test utilities for verifying real-time updates
   - Browser console testing functions

3. **`/app/test-counts/page.tsx`**:
   - Added "Test Real-time" button
   - Integrated testing functionality

## How It Works Now

### Real-time Flow:

1. **User approves/declines** content in admin/publisher panel
2. **Database change occurs** (status: pending → approved/declined)
3. **Supabase real-time** detects the change on the table
4. **Subscription triggers** the debounced fetch function
5. **Count is refetched** from database (300ms debounce delay)
6. **Badge updates** automatically in sidebar

### Debouncing Benefits:

- **Prevents spam**: Multiple rapid changes don't cause excessive API calls
- **Improves performance**: Batches updates together
- **Reduces load**: Less database queries during bulk operations

## Testing Instructions

### 1. Browser Console Testing

```javascript
// Test real-time subscription
const cleanup = window.testRealtimeSubscription();

// Test full flow (create → approve → delete)
await window.testGalleryCountUpdate();

// Cleanup when done
cleanup();
```

### 2. Manual Testing

1. **Open two browser tabs**: One admin/publisher panel, one with sidebar visible
2. **Create pending content** as a regular user (gallery, events, notices)
3. **Watch sidebar counts** increase in real-time
4. **Approve/decline content** in admin panel
5. **Watch sidebar counts** decrease in real-time

### 3. Test Page

- Navigate to `/test-counts`
- Click "Test Real-time" button
- Watch console logs and sidebar counts
- Check that counts update automatically

## Expected Behavior

### Before Fix:

- ❌ Counts only updated on page refresh
- ❌ Real-time subscriptions missed status changes
- ❌ Users had to manually refresh to see updates

### After Fix:

- ✅ Counts update automatically within 300ms
- ✅ Real-time subscriptions catch all status changes
- ✅ Multiple admins see updates simultaneously
- ✅ Debouncing prevents excessive API calls

## Monitoring

### Console Logs to Watch For:

```
Gallery change detected: { eventType: "UPDATE", ... }
Notice board change detected: { eventType: "UPDATE", ... }
Event change detected: { eventType: "INSERT", ... }
```

### Troubleshooting:

1. **No console logs**: Check Supabase real-time is enabled
2. **Logs but no updates**: Check database permissions
3. **Excessive logs**: Debouncing may need adjustment
4. **Delayed updates**: Network latency or database performance

## Performance Impact

- **Positive**: Debouncing reduces API calls
- **Positive**: More targeted database queries
- **Minimal**: Listening to all table changes vs. filtered changes
- **Improved UX**: Immediate visual feedback

## Future Enhancements

1. **Visual feedback**: Show loading state during updates
2. **Error handling**: Retry failed updates
3. **Offline support**: Queue updates when offline
4. **Batch updates**: Group multiple changes together
5. **User notifications**: Toast when counts change

The real-time count badge system now provides immediate, accurate feedback when content is approved or declined, significantly improving the admin and publisher workflow experience.
