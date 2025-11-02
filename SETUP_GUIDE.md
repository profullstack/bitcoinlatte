# BitcoinLatte - Complete Setup Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Save your database password
5. Wait for project to initialize (~2 minutes)

#### Run Database Migrations
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run
4. Copy contents of `supabase/migrations/002_rls_policies.sql`
5. Paste and run

#### Create Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Click "New Bucket"
3. Name: `shop-images`
4. Public: Yes
5. File size limit: 5MB
6. Allowed MIME types: `image/jpeg, image/png, image/webp`

#### Configure Auth
1. Go to Authentication > Providers
2. Enable Email provider
3. Disable "Confirm email" (for easier testing)
4. Set Site URL to `http://localhost:3000`
5. Add redirect URL: `http://localhost:3000/api/auth/callback`

### 3. Get API Keys

#### HERE.com API Key
1. Go to [developer.here.com](https://developer.here.com)
2. Sign up for free account
3. Create new project
4. Generate REST API key
5. Copy the API key

#### ValueSERP API Key (Optional)
1. Go to [valueserp.com](https://www.valueserp.com)
2. Sign up for account
3. Get API key from dashboard

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Get from HERE.com developer portal
HERE_API_KEY=your_here_api_key_here

# Optional: Get from ValueSERP
VALUESERP_API_KEY=your_valueserp_key_here

# Local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 First Steps After Setup

### Create Your First Admin User

1. Visit http://localhost:3000/auth/login
2. Enter your email
3. Check email for magic link
4. Click the link to login
5. In Supabase Dashboard > Table Editor > profiles
6. Find your user and set `is_admin = true`

### Test the App

1. **Browse Shops**: Visit homepage to see map
2. **Submit Shop**: Click "Submit Shop" and fill form
3. **Review Submission**: Login as admin, go to `/admin`
4. **Approve Shop**: Review and approve your test submission
5. **View Shop**: See it appear on the map!

## 🔧 Development Commands

```bash
# Development
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Supabase (if using local development)
pnpx supabase start      # Start local Supabase
pnpx supabase stop       # Stop local Supabase
pnpx supabase db push    # Push migrations to remote
pnpx supabase db pull    # Pull schema from remote
pnpx supabase db reset   # Reset local database
```

## 🚢 Deployment

### Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Create New Project**
   ```bash
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set HERE_API_KEY=your_key
   railway variables set NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
   ```

5. **Deploy**
   ```bash
   railway up
   ```

The `railway.toml` file is already configured!

### Deploy to Vercel (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings > Environment Variables
   - Add all variables from `.env.example`

## 🐛 Troubleshooting

### Map Not Loading
- Check that Leaflet CSS is imported in `globals.css`
- Verify the component is using `dynamic` import with `ssr: false`
- Check browser console for errors

### Address Autocomplete Not Working
- Verify HERE_API_KEY is set correctly
- Check API key has geocoding permissions
- Look for CORS errors in console

### Images Not Uploading
- Verify storage bucket `shop-images` exists
- Check bucket is set to public
- Verify file size is under 5MB
- Check allowed MIME types

### Authentication Issues
- Verify Supabase Auth is enabled
- Check redirect URLs are configured
- Ensure Site URL matches your domain
- Check email provider is enabled

### Database Errors
- Verify migrations ran successfully
- Check RLS policies are enabled
- Ensure user has proper permissions
- Check Supabase logs for details

## 📊 Database Management

### View Data
- Supabase Dashboard > Table Editor
- Or use SQL Editor for queries

### Backup Database
```bash
pnpx supabase db dump -f backup.sql
```

### Reset Database (Local)
```bash
pnpx supabase db reset
```

## 🔐 Security Checklist

- [ ] Environment variables not committed to git
- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secret
- [ ] File upload size limits enforced
- [ ] Rate limiting configured (production)
- [ ] CORS properly configured
- [ ] Admin routes protected

## 📈 Monitoring

### Check Application Health
- Supabase Dashboard > Logs
- Railway Dashboard > Metrics
- Browser DevTools > Network/Console

### Monitor Database
- Supabase Dashboard > Database > Query Performance
- Check slow queries
- Monitor connection pool

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts` and `public/manifest.json`

### Add More Crypto Types
Edit `CRYPTO_OPTIONS` in `src/app/shops/submit/page.tsx`

### Modify Map Tiles
Change TileLayer URL in `src/components/Map/ShopMap.tsx`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [HERE.com API Docs](https://developer.here.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Getting Help

- Check [GitHub Issues](https://github.com/yourusername/bitcoinlatte/issues)
- Review [Documentation](docs/README.md)
- Join our community discussions

---

Happy coding! ☕️₿