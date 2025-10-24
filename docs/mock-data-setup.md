# Mock Data System Documentation

## Overview

The Mock Data System provides a fully functional test environment that uses in-memory JSON data instead of connecting to Supabase. This is perfect for:

- **Client Demos**: Showcase features without affecting production data
- **Testing**: Reproducible test scenarios with consistent data
- **Offline Development**: Work without internet connection
- **Cost Savings**: No database costs for staging environments

## Key Features

- ✅ **Complete Supabase API Simulation**: All database, auth, storage, and realtime operations
- ✅ **In-Memory Persistence**: Data persists during the session but resets on page reload
- ✅ **Realistic Delays**: Simulates network latency for authentic experience
- ✅ **Test Accounts**: Multiple pre-configured users with different roles
- ✅ **Developer Tools**: Visual banner with user switching and data management
- ✅ **Realtime Events**: Mock subscriptions and broadcasts
- ✅ **Type-Safe**: Full TypeScript support matching real Supabase client

## Getting Started

### 1. Enable Mock Mode

Create or update your `.env.local` file:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. Start Development Server

```bash
npm run dev
```

You should see a prominent orange banner at the top indicating mock mode is active.

### 3. Sign In with Test Account

Use any of these test accounts:

**Universal Password**: All accounts accept the password `Demo@123.` for easier demonstrations.

| Email                | Password    | Role      | Description                  |
| -------------------- | ----------- | --------- | ---------------------------- |
| `admin@test.com`     | `Demo@123.` | Admin     | Full system access           |
| `publisher@test.com` | `Demo@123.` | Publisher | Content approval permissions |
| `user@test.com`      | `Demo@123.` | User      | Regular user access          |
| `pending@test.com`   | `Demo@123.` | Pending   | Account pending approval     |
| `rejected@test.com`  | `Demo@123.` | Rejected  | Account rejected             |

> **Note**: Original individual passwords (e.g., `admin123`) still work, but `Demo@123.` provides universal access.

## Mock Data Banner

When mock mode is active, an orange banner appears at the top of every page with these controls:

### Switch User

- Quickly switch between test accounts
- No need to log out and log back in
- Page automatically reloads with new user

### Reset Data

- Restore all mock data to original fixtures
- Clears all changes made during the session
- Useful for starting fresh demos

### Export

- Download current mock data state as JSON
- Helpful for debugging
- Can inspect data structure

### Close Banner

- Hide the banner temporarily
- Doesn't disable mock mode
- Banner reappears on page refresh

## Architecture

### Components

#### 1. Mock Data Service (`lib/mock-data/mock-service.ts`)

- Core in-memory data store
- Implements CRUD operations
- Query filtering and sorting
- RPC function simulation

#### 2. Mock Auth Service (`lib/mock-data/mock-auth.ts`)

- Authentication simulation
- Session management
- User switching
- OAuth mock flows

#### 3. Mock Storage Service (`lib/mock-data/mock-storage.ts`)

- File upload simulation
- Mock CDN URL generation
- File metadata tracking

#### 4. Mock Realtime Service (`lib/mock-data/mock-realtime.ts`)

- Channel subscriptions
- Event broadcasting
- Change notifications

#### 5. Mock Client (`lib/supabase/mock-client.ts`)

- Supabase client interface implementation
- Query builder
- Integrates all mock services

### Data Flow

```
User Action
    ↓
Supabase Client (mock-client.ts)
    ↓
Mock Query Builder
    ↓
Mock Data Service (CRUD operations)
    ↓
In-Memory Store (fixtures data)
    ↓
Realtime Broadcast (optional)
    ↓
UI Update
```

## Fixtures

Mock data is loaded from JSON fixtures in `lib/mock-data/fixtures/`:

| File                   | Contents                               |
| ---------------------- | -------------------------------------- |
| `users.json`           | Test user accounts                     |
| `profiles.json`        | User profile data                      |
| `family-members.json`  | Family tree data (12 members)          |
| `events.json`          | Calendar events (6 events)             |
| `notices.json`         | Notice board posts (6 notices)         |
| `gallery.json`         | Gallery photos (8 photos)              |
| `albums.json`          | Photo albums (6 albums)                |
| `history.json`         | Family history timeline (11 entries)   |
| `notifications.json`   | System notifications (7 notifications) |
| `invitations.json`     | Event invitations (5 invitations)      |
| `member-requests.json` | Family member requests (3 requests)    |
| `landing-page.json`    | Landing page sections (6 sections)     |

### Modifying Fixtures

1. Edit the JSON file in `lib/mock-data/fixtures/`
2. Follow the existing structure
3. Ensure IDs are unique
4. Maintain relationships (foreign keys)
5. Restart dev server or click "Reset Data"

Example: Adding a new event to `events.json`:

```json
{
  "id": "event-007",
  "name": "Summer BBQ",
  "user_id": "admin-user-id-001",
  "date": "2025-08-15",
  "category": "Social",
  "description": "Casual summer gathering",
  "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  "status": "approved",
  "is_public": true,
  "created_at": "2024-04-20T00:00:00Z",
  "updated_at": "2024-04-20T00:00:00Z"
}
```

## Development

### Using Mock Data in Your Code

The mock client is a drop-in replacement for the real Supabase client:

```typescript
import { supabase } from "@/lib/supabase/client";

// This works in both mock and real mode
const { data, error } = await supabase
  .from("events")
  .select("*")
  .eq("status", "approved")
  .order("date", { ascending: true });
```

### Checking Mock Mode

```typescript
import { isMockMode } from "@/lib/mock-data/initialize";

if (isMockMode()) {
  // Mock-specific logic
}
```

### Programmatic Data Reset

```typescript
import { resetMockData } from "@/lib/mock-data/initialize";

await resetMockData();
```

### Exporting Current State

```typescript
import { exportMockData } from "@/lib/mock-data/initialize";

const currentState = exportMockData();
console.log(currentState);
```

## Testing Scenarios

### Test User Approval Flow

1. Sign in as `pending@test.com`
2. Verify pending approval page appears
3. Switch to `admin@test.com`
4. Navigate to admin panel
5. Approve the pending user

### Test Content Creation

1. Sign in as `user@test.com`
2. Create a new event
3. Verify it shows as "pending"
4. Switch to `admin@test.com`
5. Approve the event
6. Verify it appears publicly

### Test Realtime Updates

1. Open app in two browser windows
2. Sign in as different users
3. Create/update content in one window
4. Observe realtime updates in other window

### Test File Uploads

1. Navigate to gallery
2. Upload a photo
3. Verify mock CDN URL is generated
4. Photo appears in gallery

## Limitations

### Current Limitations

1. **Session-Only Persistence**: Data resets on page reload
2. **No Server-Side API**: API routes still hit real Supabase (or fail)
3. **File Content**: Uploaded files generate mock URLs, content isn't stored
4. **OAuth Redirects**: Simplified - no external OAuth provider
5. **Middleware**: Bypassed completely in mock mode

### Not Implemented

- Email sending (password resets, notifications)
- Actual file storage and retrieval
- Database triggers and functions
- Row-level security (RLS) policies
- Postgres-specific features

## Troubleshooting

### Mock Mode Not Activating

**Issue**: Banner doesn't appear, real Supabase is being used

**Solutions**:

1. Check `.env.local` has `NEXT_PUBLIC_USE_MOCK_DATA=true`
2. Restart development server
3. Clear browser cache
4. Check browser console for errors

### Data Not Persisting

**Issue**: Changes lost immediately

**Expected**: Mock data is session-only and resets on page reload. This is by design.

**Solution**: Use "Export" button before reload to save state for debugging

### Authentication Fails

**Issue**: Can't sign in with test accounts

**Solutions**:

1. Verify using correct email/password from test accounts table
2. Check browser console for errors
3. Clear sessionStorage: `sessionStorage.clear()`
4. Reset mock data using banner

### Fixtures Not Loading

**Issue**: Empty data or errors on startup

**Solutions**:

1. Check fixture JSON files are valid JSON
2. Look for syntax errors in fixtures
3. Check browser console for import errors
4. Verify all fixture files exist

### Realtime Not Working

**Issue**: Updates don't appear in real-time

**Expected**: Mock realtime has 50-150ms delay to simulate network

**Solutions**:

1. Wait a moment for updates
2. Check browser console for subscription errors
3. Verify channel names match between components

## Performance

Mock mode is typically **faster** than real Supabase because:

- No network requests
- No database queries
- In-memory operations
- Simulated delays are shorter than real network

Expected response times:

- Database queries: 50-150ms
- Authentication: 100-300ms
- File uploads: 200-500ms
- Realtime events: 50-150ms

## Security

### Important Notes

⚠️ **Never use mock mode in production!**

Mock mode:

- Bypasses all authentication checks
- Has no data validation
- Exposes test credentials
- Has no security measures

### Preventing Production Use

The mock mode check is environment-based:

```typescript
const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
```

Ensure your production environment never sets this variable.

## Best Practices

### For Demos

1. **Reset Before Demo**: Click "Reset Data" to start with clean fixtures
2. **Plan User Flow**: Know which test account to use
3. **Prepare Talking Points**: Explain features without technical details
4. **Hide Banner if Needed**: Click X to hide (still in mock mode)

### For Development

1. **Regular Resets**: Reset data when it gets messy
2. **Export Interesting States**: Save useful configurations
3. **Test All Roles**: Switch between users to test permissions
4. **Verify Real Mode**: Periodically test with real Supabase

### For Testing

1. **Consistent Fixtures**: Don't modify fixtures during test runs
2. **Reset Between Tests**: Start each test with fresh data
3. **Document Test Accounts**: Track which accounts test what
4. **Use Export**: Debug failing tests by exporting state

## FAQ

**Q: Can I use mock mode in production?**
A: No. Mock mode is for development and demos only.

**Q: Will my changes persist?**
A: Only during the current session. Page reload resets all data.

**Q: Can I add more test users?**
A: Yes, edit `lib/mock-data/fixtures/users.json` and `profiles.json`

**Q: How do I disable mock mode?**
A: Remove or set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local`

**Q: Does mock mode work with the mobile app?**
A: It's designed for web browsers. Mobile app support depends on implementation.

**Q: Can I import real data as fixtures?**
A: Yes, export from real database and format as JSON fixtures.

**Q: Are API routes affected?**
A: API routes still try to hit real Supabase. Most operations happen client-side in mock mode.

**Q: Can I test email features?**
A: Email operations are mocked - they log to console but don't send actual emails.

## Support

For issues or questions:

1. Check browser console for errors
2. Review this documentation
3. Examine fixture files for data structure
4. Export mock data state for debugging
5. Reset mock data to resolve most issues

## Version History

- **v1.0** (2024): Initial implementation
  - Complete Supabase mock
  - Test accounts
  - Developer tools banner
  - Comprehensive fixtures
