# Metadata Implementation Guide

This document outlines the comprehensive metadata implementation for the Mosuro Family Tree application, providing SEO optimization and social media sharing capabilities.

## Overview

The metadata system provides:

- **SEO Optimization**: Proper title tags, meta descriptions, and keywords
- **Social Media Sharing**: Open Graph and Twitter Card support
- **Search Engine Indexing**: Structured data and canonical URLs
- **Accessibility**: Proper page titles and descriptions

## Architecture

### 1. Server Components (Preferred)

For pages that can be server components, use the `generatePageMetadata` function:

```typescript
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const metadata: Metadata = generatePageMetadata("familyTree");
```

### 2. Client Components

For pages that must use "use client", use the `ClientMetadata` component:

```typescript
import ClientMetadata from "@/components/seo/client-metadata";

export default function MyPage() {
  return (
    <>
      <ClientMetadata
        title="Custom Page Title"
        description="Custom page description"
        keywords={["custom", "keywords"]}
      />
      {/* Page content */}
    </>
  );
}
```

## File Structure

```
lib/constants/
├── metadata.ts              # Main metadata configuration
lib/utils/
├── metadata-helpers.ts      # Utility functions for dynamic metadata
components/seo/
├── client-metadata.tsx      # Client-side metadata component
├── structured-data.tsx      # JSON-LD structured data component
```

## Configuration

### Default Metadata (`lib/constants/metadata.ts`)

The main configuration file contains:

- **DEFAULT_METADATA**: Base metadata used across all pages
- **PAGE_METADATA**: Specific metadata for each page type
- **generatePageMetadata()**: Function to generate complete metadata objects
- **Helper functions**: For dynamic content like profiles and events

### Key Features

1. **Consistent Branding**: All pages use consistent site name, author, and base URL
2. **SEO Keywords**: Comprehensive keyword strategy for family tree content
3. **Social Sharing**: Optimized Open Graph and Twitter Card metadata
4. **Search Engine Optimization**: Proper robots meta tags and canonical URLs

## Implementation Status

### ✅ Completed Pages

#### Server Components (with `export const metadata`)

- Root layout (`app/layout.tsx`)
- Family tree page (`app/(landing)/family-tree/page.tsx`)
- History page (`app/(landing)/history/page.tsx`)
- Sign in page (`app/(auth)/sign-in/page.tsx`)
- Sign up page (`app/(auth)/sign-up/page.tsx`)
- Forgot password page (`app/(auth)/forgot-password/page.tsx`)
- Reset password page (`app/(auth)/reset-password/page.tsx`)
- OTP verification page (`app/(auth)/otp-verification/page.tsx`)

#### Client Components (with `ClientMetadata`)

- Dashboard page (`app/dashboard/page.tsx`)
- Admin dashboard (`app/admin/page.tsx`)
- Publisher dashboard (`app/publisher/page.tsx`)
- Family members page (`app/(landing)/family-members/page.tsx`)
- Events page (`app/(landing)/events/page.tsx`)
- Gallery page (`app/(landing)/gallery/page.tsx`)
- Notice board page (`app/(landing)/notice-board/page.tsx`)

### 📋 Metadata Coverage

Each page includes:

- **Title**: Descriptive, SEO-optimized titles
- **Description**: Compelling meta descriptions (150-160 characters)
- **Keywords**: Relevant keywords for family tree content
- **Open Graph**: Facebook/LinkedIn sharing optimization
- **Twitter Cards**: Twitter sharing optimization
- **Canonical URLs**: Prevent duplicate content issues
- **Robots**: Proper indexing instructions

## Usage Examples

### Basic Page Metadata

```typescript
// Server component
export const metadata: Metadata = generatePageMetadata("familyMembers");

// Client component
<ClientMetadata
  title="Family Members - Meet the Mosuro Family"
  description="Meet all members of the Mosuro family..."
  keywords={["family members", "profiles"]}
/>;
```

### Dynamic Metadata

```typescript
// For profile pages
import { generateProfileMetadata } from "@/lib/constants/metadata";

export const metadata: Metadata = generateProfileMetadata(
  "John Mosuro",
  "John is a beloved member of the Mosuro family..."
);
```

### Custom Metadata

```typescript
export const metadata: Metadata = generatePageMetadata("signIn", {
  title: "Custom Title - Mosuro Family Tree",
  description: "Custom description for this specific page",
  keywords: ["custom", "keywords"],
});
```

## Advanced Features

### Structured Data Support

Use the `StructuredData` component for rich snippets:

```typescript
import StructuredData from "@/components/seo/structured-data";
import { generatePersonStructuredData } from "@/lib/utils/metadata-helpers";

const personData = generatePersonStructuredData({
  name: "John Mosuro",
  image: "/images/john.jpg",
  description: "Family member description",
});

return (
  <>
    <StructuredData data={personData} />
    {/* Page content */}
  </>
);
```

### Available Structured Data Types

1. **Person**: For family member profiles
2. **Event**: For family events and gatherings
3. **Organization**: For the family organization
4. **Breadcrumb**: For navigation breadcrumbs

## Best Practices

### 1. Title Optimization

- Keep titles under 60 characters
- Include primary keywords
- Use consistent branding ("- Mosuro Family Tree")
- Make titles descriptive and compelling

### 2. Meta Descriptions

- Keep between 150-160 characters
- Include primary and secondary keywords
- Write compelling copy that encourages clicks
- Avoid duplicate descriptions across pages

### 3. Keywords

- Use 5-10 relevant keywords per page
- Include both primary and long-tail keywords
- Avoid keyword stuffing
- Focus on family tree and genealogy terms

### 4. Open Graph Images

- Use 1200x630px images for optimal sharing
- Include family photos or branded graphics
- Ensure images are relevant to page content
- Store images in `/public/images/og/` directory

## Environment Variables

Set these environment variables for proper metadata functionality:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
GOOGLE_VERIFICATION_ID=your-google-verification-id
YANDEX_VERIFICATION_ID=your-yandex-verification-id
YAHOO_VERIFICATION_ID=your-yahoo-verification-id
```

## Testing

### SEO Testing Tools

1. **Google Search Console**: Monitor search performance
2. **Facebook Sharing Debugger**: Test Open Graph tags
3. **Twitter Card Validator**: Test Twitter sharing
4. **Google Rich Results Test**: Test structured data

### Manual Testing

1. Check page titles in browser tabs
2. Test social media sharing on different platforms
3. Verify meta descriptions in search results
4. Validate structured data markup

## Maintenance

### Regular Tasks

1. **Update Keywords**: Review and update keywords based on search performance
2. **Monitor Performance**: Track SEO metrics and social sharing
3. **Content Updates**: Keep metadata current with content changes
4. **Image Optimization**: Ensure OG images are optimized and relevant

### Adding New Pages

1. Determine if page should be server or client component
2. Add page metadata to `PAGE_METADATA` object if it's a new page type
3. Implement appropriate metadata solution (server or client)
4. Test metadata implementation
5. Update this documentation if needed

## Troubleshooting

### Common Issues

1. **Metadata Not Updating**: Clear browser cache and check implementation
2. **Social Sharing Issues**: Use platform debugging tools to validate tags
3. **Search Engine Issues**: Check robots.txt and canonical URLs
4. **Client Component Issues**: Ensure `ClientMetadata` is properly imported and used

### Debug Steps

1. View page source to verify meta tags are present
2. Use browser dev tools to inspect head elements
3. Test with social media debugging tools
4. Check console for any JavaScript errors

## Future Enhancements

### Planned Features

1. **Dynamic OG Images**: Generate images based on page content
2. **Multi-language Support**: Metadata for different languages
3. **Advanced Analytics**: Track metadata performance
4. **Automated Testing**: Metadata validation in CI/CD pipeline

### Considerations

1. **Performance**: Monitor impact of client-side metadata updates
2. **SEO Evolution**: Stay updated with search engine algorithm changes
3. **Social Platform Changes**: Adapt to new social media requirements
4. **Accessibility**: Ensure metadata supports screen readers and assistive technologies

---

## Quick Reference

### Server Component Template

```typescript
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const metadata: Metadata = generatePageMetadata("pageKey");

export default function Page() {
  return <div>Content</div>;
}
```

### Client Component Template

```typescript
"use client";
import ClientMetadata from "@/components/seo/client-metadata";

export default function Page() {
  return (
    <>
      <ClientMetadata
        title="Page Title"
        description="Page description"
        keywords={["keyword1", "keyword2"]}
      />
      <div>Content</div>
    </>
  );
}
```

This implementation provides comprehensive SEO optimization while maintaining flexibility for both server and client components in the Next.js 14 App Router architecture.
