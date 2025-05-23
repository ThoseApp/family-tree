This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Google Authentication Setup

To enable Google Sign-In, follow these steps:

1. **Create OAuth credentials in Google Cloud Console**:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add your app's domain to the "Authorized JavaScript origins" (e.g., `https://your-app-domain.com`)
   - Add your Supabase authentication callback URL to "Authorized redirect URIs":
     - Format: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Click "Create" and note down the Client ID and Client Secret

2. **Configure Supabase Auth**:

   - Go to your Supabase dashboard
   - Navigate to "Authentication" > "Providers"
   - Find "Google" in the list and enable it
   - Enter the Client ID and Client Secret from Google Cloud Console
   - Save the changes

3. **Test the Integration**:
   - Sign out of your application if you're signed in
   - Go to the sign-in page and click "Continue with Google"
   - You should be redirected to Google's authentication page
   - After authenticating, you'll be redirected back to your application

The application is already configured to handle Google authentication once these setup steps are completed.
