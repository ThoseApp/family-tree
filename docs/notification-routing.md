# Notification Routing System

## Overview

The notification routing system provides automatic navigation to relevant pages based on notification types. When users click on notifications, they are automatically directed to the appropriate section of the application.

## Features

### 1. **Smart Routing Based on Notification Type**

- **Event notifications** → Events page (with optional eventId parameter)
- **Notice board notifications** → Notice board page (with optional noticeId parameter)
- **Gallery notifications** → Gallery page (with optional galleryId parameter)
- **Gallery request notifications** → Gallery requests page (admin) or Gallery page (users)
- **Gallery approved/declined notifications** → Gallery page with specific item
- **Family member request notifications** → Member requests page (admin) or Family tree page (users)

### 2. **User Role-Based Navigation**

The system automatically detects whether the user is an admin or regular user and routes accordingly:

- **Admin users**: Directed to admin-specific pages (e.g., `/admin/gallery-requests`)
- **Regular users**: Directed to dashboard pages (e.g., `/dashboard/gallery`)

### 3. **Clickable Notification Cards**

- Entire notification cards are clickable for navigation
- Hover effects and visual feedback indicate interactivity
- External link icon shows navigable notifications
- Keyboard accessibility support (Enter/Space keys)

### 4. **Toast Notification Actions**

- Real-time toast notifications include "View" action buttons
- Clicking the action button navigates to the relevant page
- Automatic mark-as-read when navigating

### 5. **Automatic Mark as Read**

- Notifications are automatically marked as read when users navigate to the related content
- No need for manual "mark as read" before navigation

## Implementation Details

### Core Components

#### 1. **Notification Router Utility** (`lib/utils/notification-router.ts`)

```typescript
getNotificationRoute(notification, options): string
isNotificationNavigable(notification): boolean
getNotificationActionText(notification): string
```

#### 2. **Enhanced Notification Store** (`stores/notifications-store.ts`)

```typescript
navigateToNotification(notification, isAdmin, router): Promise<void>
```

#### 3. **Notification Navigation Hook** (`hooks/use-notification-navigation.ts`)

```typescript
useNotificationNavigation(): void
```

#### 4. **Enhanced Notification Card** (`components/cards/notification-card.tsx`)

- Clickable cards with proper event handling
- Action buttons for explicit navigation
- Accessibility features

### Notification Types and Routes

| Notification Type       | Admin Route                         | User Route                              |
| ----------------------- | ----------------------------------- | --------------------------------------- |
| `event`                 | `/admin/events?eventId={id}`        | `/dashboard/events?eventId={id}`        |
| `notice_board`          | `/admin/notice-board?noticeId={id}` | `/dashboard/notice-board?noticeId={id}` |
| `gallery`               | `/admin/gallery?galleryId={id}`     | `/dashboard/gallery?galleryId={id}`     |
| `gallery_request`       | `/admin/gallery-requests`           | `/dashboard/gallery`                    |
| `gallery_approved`      | N/A                                 | `/dashboard/gallery?galleryId={id}`     |
| `gallery_declined`      | N/A                                 | `/dashboard/gallery?galleryId={id}`     |
| `family_member_request` | `/admin/member-requests`            | `/dashboard/family-tree`                |

### Usage Examples

#### Creating a Navigable Notification

```typescript
await createNotification({
  title: "New Event Added",
  body: "A family reunion has been scheduled.",
  type: NotificationTypeEnum.event,
  resource_id: "event-123", // Optional: specific resource ID
  user_id: userId,
  read: false,
});
```

#### Manual Navigation

```typescript
const { navigateToNotification } = useNotificationsStore();
const isAdmin = user?.user_metadata?.is_admin === true;

await navigateToNotification(notification, isAdmin, router);
```

## Testing

### Test Notifications

Use the "Create Test Notifications" button in the notifications panel to generate sample notifications for testing the routing system.

The test notifications include:

- Event notifications
- Notice board notifications
- Gallery approval notifications
- Gallery request notifications (admin only)
- Family member request notifications (admin only)

### Verification Steps

1. Click "Create Test Notifications" in the notifications panel
2. Verify that notification cards show external link icons
3. Click on notification cards to test navigation
4. Check that notifications are marked as read after navigation
5. Test toast notification "View" action buttons

## Future Enhancements

- **Deep linking**: Support for specific sections within pages
- **Parameter passing**: Pass additional context data to destination pages
- **Custom routing**: Allow notifications to specify custom routes
- **Analytics**: Track notification engagement and navigation patterns
- **Batch navigation**: Handle multiple related notifications
- **Notification preview**: Show destination page preview on hover

## Migration Notes

Existing notifications without a `type` field will fall back to the default route (dashboard/admin overview). Consider updating existing notifications to include appropriate types for better user experience.
