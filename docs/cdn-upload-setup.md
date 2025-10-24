# CDN Upload Page Setup Guide

## Overview

The CDN Upload page is a standalone image upload interface that allows editors/admins to upload images directly to your Supabase storage bucket and get public URLs. This page is separate from the main application and uses local authentication.

## Features

- **Local Authentication**: Static username/password authentication
- **Single & Bulk Upload**: Upload one or multiple images at once
- **Drag & Drop**: Intuitive drag-and-drop interface
- **File Validation**: 5MB size limit and image format validation
- **Progress Tracking**: Real-time upload progress indicators
- **URL Generation**: Automatic public URL generation for uploaded images
- **Export Functionality**: Export all successful URLs to a text file
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# CDN Upload Page Authentication
NEXT_PUBLIC_CDN_USERNAME=mosuroAdmin123
NEXT_PUBLIC_CDN_PASSWORD=Demo@123..
```

### 2. Access the Page

The CDN upload page is available at: `/cdn-upload`

Example: `https://yourdomain.com/cdn-upload`

### 3. Authentication

Use the following credentials to access the page:

- **Username**: `mosuroAdmin123`
- **Password**: `Demo@123..`

## Usage

### Login

1. Navigate to `/cdn-upload`
2. Enter the username and password
3. Click "Login"

### Upload Images

1. **Drag & Drop**: Drag images directly onto the upload area
2. **File Browser**: Click "Select Files" to browse and select images
3. **Bulk Upload**: Select multiple files at once for bulk upload

### Supported Formats

- JPEG/JPG
- PNG
- WebP
- GIF
- SVG
- BMP
- TIFF

### File Size Limit

- Maximum file size: 5MB per image

### Get URLs

1. After successful upload, URLs are automatically generated
2. Click the copy button to copy individual URLs
3. Use "Export URLs" to download all successful URLs as a text file

## Storage Details

- **Bucket**: Uses your existing `family-tree-bucket`
- **Folder**: Images are stored in the `cdn` folder
- **Naming**: Files are renamed with timestamp and random string for uniqueness
- **Public Access**: All uploaded images get public URLs immediately

## Security Features

- **Local Authentication**: No database authentication required
- **Environment Variables**: Credentials stored in environment variables
- **File Validation**: Strict file type and size validation
- **Unique Naming**: Prevents file conflicts with timestamp-based naming

## Error Handling

The page includes comprehensive error handling for:

- Invalid file types
- File size exceeding limits
- Upload failures
- Network issues
- Authentication failures

## Troubleshooting

### Authentication Issues

- Verify environment variables are set correctly
- Check that the credentials match exactly (case-sensitive)

### Upload Failures

- Ensure Supabase storage bucket is properly configured
- Check file size (must be under 5MB)
- Verify file format is supported
- Check network connection

### Missing URLs

- Ensure the upload completed successfully (green checkmark)
- Check Supabase storage permissions
- Verify bucket public access is configured

## Technical Details

### File Structure

```
app/cdn-upload/
└── page.tsx          # Main CDN upload page component
```

### Dependencies

- Uses existing Supabase client configuration
- Leverages shadcn/ui components
- Integrates with your Tailwind CSS setup

### Storage Path

Uploaded files are stored at: `cdn/{timestamp}-{random}.{extension}`

Example: `cdn/1703123456789-abc123.jpg`

## Maintenance

### Updating Credentials

1. Update environment variables in `.env.local`
2. Restart the application
3. New credentials will take effect immediately

### Storage Management

- Monitor storage usage in Supabase dashboard
- Set up storage policies if needed
- Consider implementing cleanup scripts for old files

## Integration Notes

This page is completely standalone and doesn't integrate with:

- User authentication system
- Database records
- Application permissions
- User roles

It's designed specifically for quick CDN-style image uploads with minimal overhead.
