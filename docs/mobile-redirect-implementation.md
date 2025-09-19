# Mobile Redirect Implementation

## Overview

The Kith & Kin Family Tree application now includes a comprehensive mobile redirect system that guides **all mobile users** to view the application on desktop devices for the optimal experience. The entire platform redirects mobile users except for authentication pages, maintaining the application's aesthetics while providing clear instructions for mobile users.

## Features

### 🎨 Beautiful UI/UX

- Consistent with application design system
- Uses existing color scheme and components
- Responsive design for different mobile screen sizes
- Smooth animations and transitions

### 📱 Smart Detection

- Detects mobile devices (< 768px width)
- Handles tablets in portrait mode
- Provides landscape rotation hints for tablets
- Real-time screen size monitoring

### 🔧 Flexible Configuration

- Configurable per layout/page
- Option to allow mobile access for specific pages
- Customizable titles and messages
- Force redirect option for testing

## Implementation Details

### Core Components

#### 1. `MobileRedirectScreen` Component

Located: `components/mobile-redirect-screen.tsx`

A beautiful full-screen component that displays the mobile redirect message with:

- Application logo and branding
- Clear instructions for desktop access
- Device comparison visualization
- Rotation hints for tablets
- Refresh button functionality

#### 2. `useMobileDetection` Hook

Located: `hooks/use-mobile-detection.ts`

Provides real-time screen size detection with:

- Mobile/tablet/desktop classification
- Orientation detection
- Screen dimensions
- Smart redirect logic

#### 3. `MobileResponsiveWrapper` Component

Located: `components/wrappers/mobile-responsive-wrapper.tsx`

A wrapper component that conditionally renders mobile redirect or children based on screen size.

### Layout Integration

The mobile redirect has been integrated into all main layouts:

#### Dashboard Layout (`app/dashboard/layout.tsx`)

- Shows "Dashboard Access Required" message
- Redirects mobile and small tablet users

#### Admin Layout (`app/admin/layout.tsx`)

- Shows "Admin Panel Access Required" message
- Redirects mobile and small tablet users

#### Publisher Layout (`app/publisher/layout.tsx`)

- Shows "Publisher Panel Access Required" message
- Redirects mobile and small tablet users

#### Landing Layout (`app/(landing)/layout.tsx`)

- Shows "Desktop Experience Required" message
- Redirects **all mobile users** from all landing pages
- No exceptions for any landing pages

#### Auth Layout (`app/(auth)/layout.tsx`)

- **No mobile redirect** - remains fully mobile-friendly
- Users can authenticate on mobile devices

## Breakpoint Strategy

The implementation uses the following breakpoint strategy:

```typescript
// Mobile: < 768px (below md breakpoint)
const isMobile = width < 768;

// Tablet: 768px - 1024px (md to lg breakpoint)
const isTablet = width >= 768 && width < 1024;

// Desktop: >= 1024px (lg breakpoint and above)
const isDesktop = width >= 1024;
```

### Redirect Logic

Mobile redirect is shown when:

1. Screen width < 768px (mobile devices)
2. Tablet in portrait mode (768-1024px width, portrait orientation)

## Usage Examples

### Basic Usage in Layout

```tsx
import MobileResponsiveWrapper from "@/components/wrappers/mobile-responsive-wrapper";

const MyLayout = ({ children }) => {
  return (
    <MobileResponsiveWrapper
      mobileTitle="Desktop Required"
      mobileSubtitle="My Application"
      showRotateHint={true}
    >
      {children}
    </MobileResponsiveWrapper>
  );
};
```

### Platform-Wide Implementation

```tsx
const MyLayout = ({ children }) => {
  return (
    <MobileResponsiveWrapper
      mobileTitle="Desktop Experience Required"
      mobileSubtitle="My Application"
      showRotateHint={true}
    >
      {children}
    </MobileResponsiveWrapper>
  );
};
```

**Note**: The `allowMobile` prop should only be used for authentication pages or other critical mobile-friendly flows.

### Force Redirect for Testing

```tsx
<MobileResponsiveWrapper forceRedirect={true}>
  {children}
</MobileResponsiveWrapper>
```

## Configuration Options

### MobileResponsiveWrapper Props

| Prop             | Type      | Default                       | Description                                 |
| ---------------- | --------- | ----------------------------- | ------------------------------------------- |
| `mobileTitle`    | `string`  | "Desktop Experience Required" | Title shown on mobile redirect screen       |
| `mobileSubtitle` | `string`  | "Kith & Kin Family Tree"      | Subtitle/app name                           |
| `showRotateHint` | `boolean` | `true`                        | Show rotation hint for tablets              |
| `forceRedirect`  | `boolean` | `false`                       | Always show redirect (for testing)          |
| `allowMobile`    | `boolean` | `false`                       | Never show redirect (mobile-friendly pages) |

### MobileRedirectScreen Props

| Prop             | Type      | Default                       | Description               |
| ---------------- | --------- | ----------------------------- | ------------------------- |
| `title`          | `string`  | "Desktop Experience Required" | Main title                |
| `subtitle`       | `string`  | "Kith & Kin Family Tree"      | App subtitle              |
| `showRotateHint` | `boolean` | `true`                        | Show tablet rotation hint |

## Testing

### Platform-Wide Coverage

The mobile redirect now covers the entire platform:

- **Landing pages**: All pages redirect mobile users
- **Dashboard**: All dashboard pages redirect mobile users
- **Admin panel**: All admin pages redirect mobile users
- **Publisher panel**: All publisher pages redirect mobile users
- **Authentication**: Remains mobile-friendly (no redirect)

### Manual Testing

1. Resize browser window to different widths
2. Test on actual mobile devices
3. Test tablet orientation changes
4. Verify auth pages remain mobile-friendly

### Breakpoint Testing

- **< 768px**: Should show mobile redirect
- **768px - 1024px (portrait)**: Should show mobile redirect
- **768px - 1024px (landscape)**: Should allow access
- **≥ 1024px**: Should allow access

## Browser Support

The implementation uses modern web APIs and should work on:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- Uses `useEffect` with cleanup for event listeners
- Prevents hydration issues with SSR
- Minimal JavaScript bundle impact
- No external dependencies beyond existing UI components

## Accessibility

- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast support through design system

## Future Enhancements

Potential improvements for future versions:

1. User preference storage (remember "continue anyway" choice)
2. Progressive Web App (PWA) detection
3. Device-specific messaging
4. Analytics tracking for mobile redirect events
5. A/B testing for different redirect messages

## Troubleshooting

### Common Issues

1. **Redirect not showing on mobile**

   - Check if `allowMobile={true}` is set
   - Verify screen width detection in browser dev tools

2. **Redirect showing on desktop**

   - Check browser zoom level
   - Verify window width is ≥ 1024px

3. **Hydration errors**

   - The hook includes SSR protection
   - Ensure components are client-side only with "use client"

4. **Auth pages redirecting**
   - Auth layout should not include MobileResponsiveWrapper
   - Check layout hierarchy

### Debug Information

Use the demo component or browser dev tools to check:

- `window.innerWidth` and `window.innerHeight`
- Device pixel ratio
- User agent string
- Viewport meta tag configuration

## Maintenance

### Regular Checks

- Test on new device releases
- Monitor analytics for mobile redirect rates
- Update breakpoints if design system changes
- Review user feedback for mobile experience

### Updates

When updating the mobile redirect system:

1. Test all layouts thoroughly
2. Check responsive design across breakpoints
3. Verify auth flow remains unaffected
4. Update documentation as needed
