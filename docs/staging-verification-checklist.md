# Staging Environment Verification Checklist

Use this checklist to ensure your staging environment is properly set up.

## ✅ Environment Setup

- [ ] Created `.env.staging` file with correct Supabase credentials
- [ ] Copied `.env.staging` to `.env.local` for local development
- [ ] Updated `next.config.mjs` with staging Supabase hostname
- [ ] On `staging` git branch

## ✅ Database Tables

- [ ] `profiles` - User profiles table
- [ ] `notifications` - System notifications  
- [ ] `family_member_requests` - Family member addition requests
- [ ] `albums` - Photo albums
- [ ] `galleries` - Gallery items
- [ ] `events` - Family events
- [ ] `event_invitations` - Event invitation system
- [ ] `notice_boards` - Notice board posts
- [ ] `family_tree` - Family tree structure
- [ ] `life_events` - Life events tracking
- [ ] `history` - Family history records

## ✅ Database Functions

- [ ] `create_system_notification()` - Creates system notifications
- [ ] `create_system_notifications()` - Batch notification creation
- [ ] `create_admin_notifications()` - Creates admin notifications
- [ ] `get_admin_user_ids()` - Gets admin user IDs
- [ ] `set_updated_at()` - Updates timestamp triggers
- [ ] `update_notifications_updated_at()` - Notification timestamp updates

## ✅ Row Level Security

- [ ] All tables have RLS enabled
- [ ] User access policies configured
- [ ] Admin access policies configured
- [ ] Proper SELECT/INSERT/UPDATE/DELETE policies

## ✅ Storage Buckets

- [ ] `avatars` bucket (public, 5MB limit, images only)
- [ ] `gallery` bucket (public, 10MB limit, images only)  
- [ ] `documents` bucket (private, 20MB limit, PDF/images)

## ✅ Storage Policies

- [ ] Users can upload to avatars bucket
- [ ] Users can view public images
- [ ] Proper folder-based access control
- [ ] File size and type restrictions working

## ✅ Authentication

### Basic Auth
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Email verification works (if enabled)

### Profile Creation
- [ ] Profile created automatically on first login
- [ ] User metadata properly extracted
- [ ] Default role assignment works
- [ ] Approval workflow functions

### External Providers (if used)
- [ ] Google OAuth configured
- [ ] Redirect URLs correct
- [ ] Provider credentials set

## ✅ Core Application Features

### User Interface
- [ ] Landing pages load correctly
- [ ] Authentication pages work
- [ ] Dashboard accessible after login
- [ ] Navigation between pages works

### Family Tree
- [ ] Family tree visualization loads
- [ ] Can add family members
- [ ] Family relationships display correctly
- [ ] Profile pictures display

### Family Member Requests
- [ ] Can create new family member requests
- [ ] Requests appear in admin dashboard
- [ ] Admin can approve/reject requests
- [ ] Notifications sent on status changes

### Photo Galleries  
- [ ] Can create albums
- [ ] Can upload photos to galleries
- [ ] Photos display correctly
- [ ] Album organization works

### Events System
- [ ] Can create events
- [ ] Event invitations work
- [ ] RSVP functionality works
- [ ] Event status management

### Notice Board
- [ ] Can create notice board posts
- [ ] Posts display correctly
- [ ] Admin moderation works
- [ ] Status workflow functions

## ✅ Admin Features

### Dashboard Access
- [ ] Admin users can access admin dashboard
- [ ] Publisher users can access publisher dashboard
- [ ] Regular users restricted to user dashboard
- [ ] Role-based navigation works

### User Management
- [ ] Admin can view all users
- [ ] Admin can approve/reject user accounts
- [ ] Admin can manage user roles
- [ ] Bulk operations work

### Content Moderation
- [ ] Admin can moderate family member requests
- [ ] Admin can moderate notice board posts
- [ ] Admin can moderate gallery content
- [ ] Admin receives appropriate notifications

### Multi-Admin Support
- [ ] Multiple admin users can exist
- [ ] All admins receive notifications
- [ ] Admin actions tracked correctly
- [ ] No conflicts between admin actions

## ✅ Notifications System

### System Notifications
- [ ] Notifications created for key events
- [ ] Users receive appropriate notifications
- [ ] Notification counts display correctly
- [ ] Mark as read functionality works

### Admin Notifications
- [ ] Admins notified of new requests
- [ ] Admins notified of user actions
- [ ] Multi-admin notification distribution
- [ ] Notification preferences respected

## ✅ File Upload System

### Profile Pictures
- [ ] Can upload profile pictures
- [ ] Images resize/optimize correctly
- [ ] Old images cleaned up
- [ ] Proper error handling

### Gallery Photos
- [ ] Can upload multiple photos
- [ ] Photo metadata preserved
- [ ] Thumbnail generation works
- [ ] Album assignment functions

### Document Upload
- [ ] Can upload family documents
- [ ] Access control working
- [ ] File type validation
- [ ] Size limits enforced

## ✅ Performance & Optimization

### Database Performance
- [ ] Queries execute efficiently
- [ ] Indexes working correctly
- [ ] No N+1 query issues
- [ ] Connection pooling stable

### Image Optimization
- [ ] Next.js image optimization working
- [ ] Supabase images load correctly
- [ ] Proper caching headers
- [ ] Responsive images function

### Caching
- [ ] Static assets cached properly
- [ ] API responses cached where appropriate
- [ ] Browser caching working
- [ ] CDN integration (if used)

## ✅ Security Verification

### Access Control
- [ ] Unauthenticated users properly redirected
- [ ] Role-based access control working
- [ ] Protected routes secure
- [ ] API endpoints protected

### Data Security
- [ ] RLS policies preventing data leaks
- [ ] File upload restrictions working
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### Authentication Security
- [ ] Password requirements enforced
- [ ] Session management secure
- [ ] CSRF protection enabled
- [ ] Secure cookie settings

## ✅ Error Handling

### User-Facing Errors
- [ ] Graceful error messages
- [ ] Network error handling
- [ ] Form validation errors
- [ ] 404/500 page handling

### Background Errors
- [ ] Database error logging
- [ ] File upload error handling
- [ ] External API error handling
- [ ] Error monitoring setup

## ✅ Mobile Responsiveness

### Layout
- [ ] Mobile navigation works
- [ ] Responsive design functions
- [ ] Touch interactions work
- [ ] Viewport settings correct

### Features
- [ ] Photo upload from mobile
- [ ] Form interactions work
- [ ] Family tree navigation
- [ ] Notification display

## ✅ Final Integration Test

### Complete User Journey
- [ ] New user registration
- [ ] Profile setup and approval
- [ ] Family member addition
- [ ] Photo gallery creation  
- [ ] Event participation
- [ ] Notice board interaction
- [ ] Admin workflow completion

### Cross-Browser Testing
- [ ] Chrome/Chromium compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility (if applicable)
- [ ] Mobile browser testing

### Load Testing (Optional)
- [ ] Multiple concurrent users
- [ ] Large file uploads
- [ ] Database performance under load
- [ ] Memory usage acceptable

---

## 🚀 Ready for Staging!

Once all items are checked, your staging environment is ready for testing and development work.

**Remember to:**
- Keep staging data separate from production
- Regularly sync code changes from main branch  
- Test new features thoroughly before production deployment
- Monitor staging environment performance
- Clean up test data regularly
