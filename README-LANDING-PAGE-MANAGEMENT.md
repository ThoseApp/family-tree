# Landing Page Management System

## Overview

The Landing Page Management System allows administrators to dynamically edit and manage content for the family website's landing page. This system provides a user-friendly interface to update text content, images, and publish changes in real-time.

## Features Implemented

### 📝 Content Management

- **Hero Section**: Edit heading, subtitle, description, and background image
- **Gallery Preview**: Manage heading and subtitle (images managed separately)
- **Upcoming Events**: Edit heading and background image
- **History Section**: Edit heading, subtitle, description, and image
- **Family Members**: Edit heading and description (members managed separately)
- **Family Tree**: Edit heading, subtitle, description, and image

### 🖼️ Image Management

- **Upload Modal**: Intuitive image upload interface with preview
- **Image Validation**: File type and size validation (max 5MB)
- **Storage Integration**: Automatic upload to Supabase storage
- **Image Preview**: Real-time preview of uploaded images

### 💾 Data Management

- **Real-time Updates**: Changes reflect immediately in the interface
- **Draft System**: Save changes as drafts before publishing
- **Publish System**: Publish changes to make them live on the website
- **Change Tracking**: Visual indicators for unsaved changes

### 🔍 Preview System

- **Quick Preview**: Modal preview of all sections before publishing
- **Live Preview**: Open actual landing page in new tab
- **Section-by-Section**: Individual section previews

## Architecture

### Database Schema

```sql
-- landing_page_sections table
CREATE TABLE landing_page_sections (
    id UUID PRIMARY KEY,
    section_type VARCHAR(50) UNIQUE,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    content JSONB,
    is_published BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### Store Management

- **Zustand Store**: `useLandingPageStore` for state management
- **CRUD Operations**: Full create, read, update operations
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Loading indicators for better UX

### Components Structure

```
app/admin/manage-landing-page/
├── page.tsx                           # Main management interface
components/
├── modals/
│   ├── image-upload-modal.tsx         # Image upload interface
│   └── landing-page-preview-modal.tsx # Preview modal
stores/
└── landing-page-store.ts              # State management
```

## Usage

### 1. Accessing the Management Interface

Navigate to `/admin/manage-landing-page` to access the management interface.

### 2. Editing Content

- **Text Fields**: Click on any input field to edit text content
- **Images**: Click "Edit Image" buttons to upload new images
- **Save**: Use individual "Save" buttons for each section or global save

### 3. Publishing Changes

- **Save Draft**: Save changes without publishing them live
- **Publish**: Make changes live on the actual website
- **Preview**: See how changes will look before publishing

### 4. Image Upload Process

1. Click "Edit Image" on any section
2. Select image file (JPEG, PNG, WebP supported)
3. Preview the image before uploading
4. Confirm upload to save to storage

## File Structure

### New Files Added

- `app/admin/manage-landing-page/page.tsx` - Main management interface
- `stores/landing-page-store.ts` - State management store
- `components/modals/image-upload-modal.tsx` - Image upload modal
- `components/modals/landing-page-preview-modal.tsx` - Preview modal
- `migrations/landing_page_sections_table.sql` - Database migration
- `lib/types/index.ts` - Updated with LandingPageSection types
- `lib/constants/enums.ts` - Updated with landing_page bucket folder

### Modified Files

- `lib/types/index.ts` - Added LandingPageSection and LandingPageContent types
- `lib/constants/enums.ts` - Added landing_page to BucketFolderEnum

## Database Setup

Run the migration to create the required table:

```sql
-- Execute the migration file
-- migrations/landing_page_sections_table.sql
```

This will create:

- `landing_page_sections` table with proper structure
- RLS policies for security
- Default content for all sections
- Indexes for performance

## Security

### Row Level Security (RLS)

- **Public Read**: Visitors can read published sections
- **Admin Access**: Admins have full CRUD access
- **Draft Protection**: Unpublished drafts are not publicly accessible

### File Upload Security

- **File Type Validation**: Only image files allowed
- **Size Limits**: Maximum 5MB file size
- **Secure Storage**: Files stored in Supabase storage with proper permissions

## API Integration

The system integrates with:

- **Supabase Database**: For content storage
- **Supabase Storage**: For image file storage
- **Toast Notifications**: For user feedback
- **Form Validation**: For data integrity

## Performance Optimizations

- **Lazy Loading**: Images loaded on demand
- **Optimistic Updates**: UI updates immediately for better UX
- **Efficient Queries**: Indexed database queries
- **Caching**: Browser caching for uploaded images

## Error Handling

- **Network Errors**: Graceful handling of network issues
- **Validation Errors**: Real-time form validation
- **Upload Errors**: Detailed error messages for file uploads
- **Database Errors**: Fallback to default content if database fails

## Future Enhancements

Potential improvements that could be added:

- **Version History**: Track changes over time
- **Content Scheduling**: Schedule content updates
- **Multi-language Support**: Support for multiple languages
- **Advanced Image Editing**: Crop, resize, and filter images
- **SEO Management**: Meta tags and SEO optimization
- **Analytics Integration**: Track content performance

## Troubleshooting

### Common Issues

1. **Images not uploading**

   - Check file size (max 5MB)
   - Verify file type (images only)
   - Check internet connection

2. **Changes not saving**

   - Check browser console for errors
   - Verify database connection
   - Try refreshing the page

3. **Preview not working**
   - Ensure content is saved before previewing
   - Check if landing page route is accessible

### Support

For technical support or questions about the landing page management system, contact the development team or check the application logs for detailed error information.
