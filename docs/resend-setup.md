# Quick Resend Setup Guide

## 🚨 Fixing the "Forbidden" Error

The "Forbidden" error occurs because Resend authentication isn't properly configured. Follow these steps:

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address

### Step 2: Get API Key

1. Go to your [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "Family Tree App")
4. Copy the API key (starts with `re_`)

### Step 3: Set Environment Variable

Add this to your `.env.local` file:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

**Important:** Restart your Next.js development server after adding the environment variable!

### Step 4: Domain Setup (Optional but Recommended)

1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS verification steps
4. Update the "from" field in the code to use your domain:
   ```typescript
   from: "Mosuro Family Tree <noreply@yourdomain.com>";
   ```

### Step 5: Test

1. Restart your dev server: `npm run dev`
2. Try creating a user account
3. Check console for success message or error details

## 🎯 What Happens Now

**With RESEND_API_KEY set:**

- ✅ Emails will be sent via Resend
- ✅ Success/failure logged to console

**Without RESEND_API_KEY:**

- ⚠️ Emails logged to console only
- ✅ Account creation still works
- ✅ Credentials available for manual delivery

## 🔧 Testing Without Email Service

If you want to test without setting up Resend right now:

1. Don't set the `RESEND_API_KEY` environment variable
2. Create user accounts normally
3. Check the console for login credentials
4. Use those credentials to test the login flow

## 📧 Using Resend Test Domain

For testing, you can use Resend's test domain:

- From: `"App Name <onboarding@resend.dev>"`
- This works without domain verification
- Some email providers may mark as spam

## 🆘 Still Having Issues?

Check the console for detailed error messages. Common issues:

- API key not set or incorrect
- Need to restart dev server after setting env var
- Using unverified domain (switch to onboarding@resend.dev for testing)

## 🚀 Production Ready

Once working with Resend:

1. Verify your own domain
2. Update "from" field to use your domain
3. Set up proper DNS records
4. Test with various email providers
