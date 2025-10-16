# Deployment Guide - Vercel + Supabase

This guide walks you through deploying your Private APIs app to Vercel and configuring Supabase for production.

## Prerequisites

- [ ] Supabase project created
- [ ] Vercel account created
- [ ] GitHub repository (recommended)

---

## Step 1: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. **Don't deploy yet!** Click "Environment Variables" first

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## Step 2: Configure Environment Variables in Vercel

In your Vercel project settings:

1. Go to **Settings > Environment Variables**
2. Add these variables for all environments (Production, Preview, Development):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional)
```

**Where to find these values:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Navigate to **Settings > API**
- Copy the values from there

3. Click **"Save"**
4. Now click **"Deploy"**

---

## Step 3: Configure Supabase for Production

### A. Update Site URL

1. Go to [Supabase Dashboard](https://app.supabase.com) > Your Project
2. Navigate to **Authentication > URL Configuration**
3. Set **Site URL** to your Vercel domain:
   ```
   https://your-app.vercel.app
   ```

### B. Add Redirect URLs

In the same **URL Configuration** section, add these to **Redirect URLs**:

```
https://your-app.vercel.app/**
https://your-app-*.vercel.app/**
http://localhost:3000/**
```

**Why these URLs?**
- `https://your-app.vercel.app/**` - Your production domain
- `https://your-app-*.vercel.app/**` - Preview deployments (with wildcard for branch previews)
- `http://localhost:3000/**` - Local development

### C. Update Email Templates (IMPORTANT!)

Navigate to **Authentication > Email Templates** and verify:

#### Confirm Signup Template:
```html
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

#### Reset Password Template:
```html
<a href="{{ .ConfirmationURL }}">Reset your password</a>
```

**Note:** The `{{ .ConfirmationURL }}` automatically uses your Site URL + the callback path.

---

## Step 4: Test Your Deployment

### Test Authentication Flow:
1. ✅ Sign in at `https://your-app.vercel.app/auth/sign-in`
2. ✅ Try "Forgot Password" flow
3. ✅ Check email links redirect to production domain
4. ✅ Verify password reset works
5. ✅ Test protected routes (dashboard, requests, etc.)

### Test Password Reset Specifically:
1. Go to `/auth/forgot-password`
2. Enter your email
3. Check your inbox
4. Click the reset link
5. Verify it goes to `https://your-app.vercel.app/auth/reset-password`
6. Set new password
7. Verify you're redirected to dashboard

---

## Step 5: Custom Domain (Optional)

If you want to use a custom domain like `privateapis.com`:

### In Vercel:
1. Go to **Settings > Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### In Supabase:
1. Update **Site URL** to your custom domain:
   ```
   https://privateapis.com
   ```
2. Add to **Redirect URLs**:
   ```
   https://privateapis.com/**
   ```

---

## Common Issues & Troubleshooting

### Issue: "Invalid Redirect URL" error
**Solution:** Make sure you added the full URL pattern to Supabase Redirect URLs with `/**` at the end.

### Issue: Reset password link goes to localhost
**Solution:** Check your Supabase Site URL is set to your production domain, not localhost.

### Issue: Email links have wrong domain
**Solution:** Verify the Email Templates use `{{ .ConfirmationURL }}` and your Site URL is correct.

### Issue: Random logouts in production
**Solution:** This should be fixed by the middleware. Verify your middleware.ts is deployed correctly.

### Issue: CORS errors
**Solution:** Supabase anon key should work from any domain. If you see CORS errors, check that your NEXT_PUBLIC_SUPABASE_URL is correct.

---

## Multi-Environment Setup (Advanced)

If you want different Supabase projects for staging/production:

### Create Separate Environments:
1. Create a staging Supabase project
2. Create a production Supabase project

### In Vercel Environment Variables:
- **Production:** Use production Supabase credentials
- **Preview:** Use staging Supabase credentials
- **Development:** Use local/development credentials

---

## Security Checklist

- [ ] ✅ NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- [ ] ✅ SUPABASE_SERVICE_ROLE_KEY is NEVER prefixed with NEXT_PUBLIC_
- [ ] ✅ .env.local is in .gitignore (never commit secrets)
- [ ] ✅ Supabase RLS policies are enabled on all tables
- [ ] ✅ Redirect URLs are whitelisted in Supabase
- [ ] ✅ Site URL is set to production domain

---

## Need Help?

- [Supabase Docs - Auth](https://supabase.com/docs/guides/auth)
- [Vercel Docs - Environment Variables](https://vercel.com/docs/environment-variables)
- [Next.js Docs - Deployment](https://nextjs.org/docs/deployment)

---

**Your app is now production-ready! 🚀**

