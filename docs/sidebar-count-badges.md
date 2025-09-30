# Sidebar Count Badges Implementation

## Overview

Added count badges to admin and publisher sidebars to show the number of pending requests for various content types. The badges appear next to relevant menu items and update in real-time.

## Features Implemented

### 1. Count Badge Component (`/components/ui/count-badge.tsx`)

- **Variants**: `default` (red), `secondary` (blue), `outline` (border only)
- **Sizes**: `sm`, `md`, `lg`
- **Smart hiding**: Badges with count 0 are hidden by default
- **Overflow handling**: Shows "99+" for counts over 99
- **Tooltips**: Shows descriptive text on hover
- **Responsive**: Adapts to different screen sizes

### 2. Pending Counts Hook (`/hooks/use-pending-counts.ts`)

- **Real-time updates**: Uses Supabase real-time subscriptions
- **Multiple count types**: Gallery, notice board, events, member requests, family member requests
- **Error handling**: Graceful error handling and loading states
- **Performance optimized**: Parallel queries for all count types

### 3. Updated Sidebars

- **Admin Sidebar**: Shows counts for all admin-relevant request types
- **Publisher Sidebar**: Shows counts for publisher-relevant request types
- **Mobile Support**: Count badges work on mobile sidebars automatically
- **Collapsed State**: Badges are hidden when sidebar is collapsed

## Count Types Tracked

### Admin Sidebar

- **Gallery Requests** (`/admin/gallery-requests`) - Pending gallery submissions
- **Notice Board Requests** (`/admin/notice-board-requests`) - Pending notice board posts
- **Event Requests** (`/admin/events`) - Pending event submissions
- **Member Requests** (`/admin/member-requests`) - Pending user account approvals
- **Family Member Requests** (`/admin/family-member-requests`) - Pending family tree additions

### Publisher Sidebar

- **Gallery Requests** (`/publisher/gallery-requests`) - Pending gallery submissions
- **Notice Requests** (`/publisher/notice-board-requests`) - Pending notice board posts
- **Event Requests** (`/publisher/event-requests`) - Pending event submissions

## Real-time Updates

The count badges update automatically when:

- New requests are submitted
- Requests are approved/rejected
- Request status changes
- Database changes occur

This is achieved through Supabase real-time subscriptions that listen for changes to relevant tables.

## Usage Examples

### Basic Count Badge

```tsx
import { CountBadge } from "@/components/ui/count-badge";

<CountBadge count={5} />;
```

### With Variants and Sizes

```tsx
<CountBadge count={3} variant="secondary" size="md" />
<CountBadge count={0} showZero variant="outline" />
```

### In Sidebar Menu Item

```tsx
<div className="flex items-center justify-between">
  <span>Gallery Requests</span>
  <CountBadge count={galleryRequestCount} />
</div>
```

## Database Queries

The hook queries the following tables for pending counts:

```sql
-- Gallery requests
SELECT COUNT(*) FROM galleries WHERE status = 'pending';

-- Notice board requests
SELECT COUNT(*) FROM notice_boards WHERE status = 'pending';

-- Event requests
SELECT COUNT(*) FROM events WHERE status = 'pending';

-- Member requests
SELECT COUNT(*) FROM profiles WHERE status = 'pending';

-- Family member requests
SELECT COUNT(*) FROM family_member_requests WHERE status = 'pending';
```

## Performance Considerations

1. **Parallel Queries**: All counts are fetched simultaneously
2. **Real-time Subscriptions**: Only listen to relevant table changes
3. **Efficient Queries**: Use `count` with `head: true` for optimal performance
4. **Error Boundaries**: Graceful degradation if counts fail to load

## Testing

### Test Page

Navigate to `/test-counts` to:

- View current pending counts
- Test different badge variants and sizes
- Preview how badges look in sidebar context
- Inspect raw count data

### Manual Testing

1. Create pending content (events, gallery items, etc.) as a non-admin user
2. Check that count badges appear in admin/publisher sidebars
3. Approve/reject content and verify counts update
4. Test real-time updates by having multiple users create content

## Styling

### Default Appearance

- **Color**: Red background with white text
- **Size**: Small (18px min-width, 16px height)
- **Position**: Right-aligned in sidebar menu items
- **Animation**: Smooth transitions for count changes

### Responsive Behavior

- **Desktop**: Full badges with counts
- **Mobile**: Same badges in mobile sheet sidebar
- **Collapsed Sidebar**: Badges are hidden to save space

## File Structure

```
/components/ui/count-badge.tsx          # Reusable count badge component
/hooks/use-pending-counts.ts            # Hook for fetching counts
/components/admin/admin-side-bar.tsx    # Updated admin sidebar
/components/publisher/publisher-side-bar.tsx # Updated publisher sidebar
/app/test-counts/page.tsx               # Test page for verification
```

## Future Enhancements

1. **Customizable Colors**: Allow different colors for different request types
2. **Animation**: Add subtle animations when counts change
3. **Grouping**: Group related counts together
4. **Historical Data**: Track count changes over time
5. **Notifications**: Alert when counts reach certain thresholds

## Troubleshooting

### Counts Not Updating

1. Check database permissions for count queries
2. Verify real-time subscriptions are working
3. Check browser console for errors
4. Ensure user has proper access to view counts

### Performance Issues

1. Monitor database query performance
2. Check if too many real-time subscriptions are active
3. Consider debouncing rapid count updates
4. Optimize database indexes for count queries

### Styling Issues

1. Check Tailwind CSS classes are applied correctly
2. Verify responsive breakpoints work as expected
3. Test in different browsers and screen sizes
4. Ensure badges don't overflow sidebar width

The count badge system provides a clear, real-time view of pending work for administrators and publishers, improving workflow efficiency and user experience.
