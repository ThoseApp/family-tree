# Email Service Integration Guide

## Current Status

The family member account creation system is currently logging email credentials to the console instead of sending actual emails. This document provides instructions for integrating with an email service provider.

## Recommended Email Service: Resend

### 1. Sign up for Resend

1. Go to [resend.com](https://resend.com)
2. Create an account
3. Verify your domain (required for sending emails)
4. Get your API key from the dashboard

### 2. Add Environment Variable

Add your Resend API key to your environment variables:

```bash
# .env.local
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Update the API Route

In `app/api/admin/create-family-accounts/route.ts`, uncomment the Resend integration code and remove the console.log statements:

```typescript
// Replace the console.log section with:
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: "noreply@yourdomain.com", // Replace with your verified domain
    to: credentials.email,
    subject: "Welcome to Mosuro Family Tree - Your Account Details",
    html: emailHtml,
  }),
});

if (!response.ok) {
  throw new Error(`Failed to send email: ${response.statusText}`);
}
```

### 4. Update Success Message

Change the success message back to:

```typescript
message: "Account created successfully";
```

## Alternative Email Services

### SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Use their REST API similar to Resend

### Postmark

1. Sign up at [postmarkapp.com](https://postmarkapp.com)
2. Get API key
3. Use their email API

### Supabase Edge Function with Email

For more advanced email templating and management, consider creating a Supabase Edge Function that handles email sending.

## Testing Email Integration

1. Create a test family member account
2. Check that emails are being sent
3. Verify email formatting and content
4. Test with different email providers (Gmail, Outlook, etc.)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive credentials
- Verify your domain to avoid emails going to spam
- Consider implementing rate limiting for email sending

## Current Implementation Details

The system currently:

- ✅ Creates user accounts with secure passwords
- ✅ Links accounts to family tree records
- ✅ Generates proper HTML email content
- ⏳ Logs email details to console (pending email service integration)
- ✅ Auto-approves admin-created accounts

Once email service is integrated, the system will be fully functional for production use.
