# Gallery Functionality Setup

This document explains how to set up the gallery functionality in your Supabase project.

## Database Setup

You need to create a table and set up storage for the gallery images.

### 1. Create the Gallery Table and Storage Bucket

Run the SQL script in `migrations/gallery_table.sql` in your Supabase SQL editor. This script will:

- Create a `galleries` table to store image metadata
- Set up Row Level Security (RLS) policies for the table
- Create a storage bucket for the images
- Set up RLS policies for the storage bucket

### 2. Create a Storage Bucket

Ensure the `gallery` storage bucket exists in your Supabase project:

1. Go to Storage in your Supabase dashboard
2. If the `gallery` bucket doesn't exist, create it
3. Make sure it's set to public access

## Frontend Implementation

The gallery functionality is implemented through:

1. `stores/gallery-store.ts` - Zustand store for managing gallery state and Supabase interactions
2. `app/dashboard/gallery/page.tsx` - The gallery page UI
3. `components/gallery.tsx` - Gallery grid component
4. `components/modals/image-preview-modal.tsx` - Image preview modal
5. `lib/file-upload/index.ts` - Utility for handling file uploads

## How the Upload Works

The gallery upload uses the centralized file upload utility which:

1. Validates file type and size
2. Creates a unique file name
3. Uploads the file to the Supabase storage bucket
4. Returns the public URL for the uploaded file
5. Records the metadata in the database

## Testing the Gallery Functionality

Once the setup is complete, you should be able to:

1. Upload images to the gallery
2. View images in both table and grid view
3. Preview images by clicking on them
4. Delete images with confirmation
5. Search for images by caption

## Troubleshooting

If you encounter issues:

1. Check Supabase console for any errors in the database or storage
2. Ensure your bucket policies allow authenticated users to upload files
3. Verify that the RLS policies are correctly implemented
4. Check browser console for any frontend errors

## Data Structure

The `galleries` table has the following structure:

- `id` (UUID): Primary key
- `url` (TEXT): Public URL of the image
- `caption` (TEXT): Optional caption for the image
- `uploaded_at` (TIMESTAMP): When the image was uploaded
- `user_id` (UUID): Reference to the user who uploaded the image
- `file_name` (TEXT): Name of the file in storage
- `file_size` (INTEGER): Size of the file in bytes
