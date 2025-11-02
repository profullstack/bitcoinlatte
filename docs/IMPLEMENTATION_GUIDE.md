# BitcoinLatte Implementation Guide

## Project Setup Phase

### Step 1: Initialize Next.js Project

```bash
npx create-next-app@latest bitcoinlatte --typescript --tailwind --app --src-dir
cd bitcoinlatte
```

**Configuration choices:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Import alias (use default @/*)

### Step 2: Install Core Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install leaflet react-leaflet
npm install @types/leaflet --save-dev
npm install next-pwa
npm install sharp # for image optimization
```

### Step 3: Configure Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
HERE_API_KEY=your_here_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Configure PWA

Create `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
})
```

---

## Database Setup Phase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save database password
4. Wait for project initialization

### Step 2: Run Database Migrations

Execute SQL from [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) in Supabase SQL Editor:

1. Create tables in order
2. Create functions
3. Create triggers
4. Enable RLS
5. Create policies

### Step 3: Configure Storage

1. Create `shop-images` bucket
2. Set public access policies
3. Configure file size limits (5MB)
4. Set allowed MIME types

### Step 4: Configure Auth

1. Enable Email provider
2. Configure magic link settings
3. Set site URL
4. Configure redirect URLs

---

## Project Structure

```
bitcoinlatte/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/
│   │   │   ├── shops/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── nearby/route.ts
│   │   │   ├── submissions/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── approve/route.ts
│   │   │   ├── comments/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── votes/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── images/
│   │   │   │   ├── upload/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── geocode/route.ts
│   │   │   └── auth/
│   │   │       └── callback/route.ts
│   │   ├── shops/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── submit/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── submissions/page.tsx
│   │   │   └── users/page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── auth/
│   │       └── login/page.tsx
│   ├── components/
│   │   ├── Map/
│   │   │   ├── ShopMap.tsx
│   │   │   ├── MapMarker.tsx
│   │   │   └── MapCluster.tsx
│   │   ├── Shop/
│   │   │   ├── ShopCard.tsx
│   │   │   ├── ShopDetail.tsx
│   │   │   ├── ShopList.tsx
│   │   │   └── ShopFilters.tsx
│   │   ├── Submission/
│   │   │   ├── SubmissionForm.tsx
│   │   │   ├── AddressAutocomplete.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── Admin/
│   │   │   ├── SubmissionReview.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── Comments/
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── Comment.tsx
│   │   ├── Voting/
│   │   │   ├── VoteButton.tsx
│   │   │   └── VoteDisplay.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Card.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── here/
│   │   │   └── geocoding.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── constants.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── shop.ts
│   │   └── user.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useShops.ts
│       ├── useVotes.ts
│       └── useComments.ts
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── images/
│       └── bitcoin-logo.svg
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Implementation Order

### Phase 1: Foundation (Days 1-2)

1. **Project initialization**
   - Set up Next.js with TypeScript
   - Configure Tailwind CSS
   - Set up PWA configuration

2. **Supabase setup**
   - Create project
   - Run database migrations
   - Configure storage
   - Set up authentication

3. **Basic utilities**
   - Create Supabase client utilities
   - Set up TypeScript types
   - Create constants file

### Phase 2: Core Features (Days 3-5)

4. **Authentication**
   - Implement magic link login
   - Create auth context/hooks
   - Build login page
   - Add auth middleware

5. **Shop listing**
   - Create shop API routes
   - Build shop list component
   - Implement basic map view
   - Add shop detail page

6. **Submission system**
   - Build submission form
   - Implement address autocomplete
   - Add image upload
   - Create submission API routes

### Phase 3: Interactive Features (Days 6-8)

7. **Map integration**
   - Integrate Leaflet.js
   - Add interactive markers
   - Implement clustering
   - Add direction links

8. **Voting system**
   - Create vote API routes
   - Build vote components
   - Add vote aggregation
   - Implement vote restrictions

9. **Commenting system**
   - Create comment API routes
   - Build comment components
   - Add comment threading
   - Implement moderation

### Phase 4: Admin & Polish (Days 9-10)

10. **Admin dashboard**
    - Build submission review interface
    - Add user management
    - Create admin statistics
    - Implement bulk actions

11. **Search & filters**
    - Add search functionality
    - Implement crypto filters
    - Add location-based search
    - Create saved searches

12. **PWA & optimization**
    - Configure service worker
    - Add offline support
    - Optimize images
    - Implement caching

---

## Key Implementation Details

### Supabase Client Setup

**Client-side (`src/lib/supabase/client.ts`):**

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => 
  createClientComponentClient<Database>()
```

**Server-side (`src/lib/supabase/server.ts`):**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createClient = () =>
  createServerComponentClient<Database>({ cookies })
```

### HERE.com Geocoding

**Address autocomplete (`src/lib/here/geocoding.ts`):**

```typescript
export async function searchAddress(query: string) {
  const response = await fetch(
    `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&apiKey=${process.env.HERE_API_KEY}`
  )
  return response.json()
}

export async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${process.env.HERE_API_KEY}`
  )
  return response.json()
}
```

### Image Upload Flow

1. User selects image
2. Client validates size/type
3. Upload to Supabase Storage
4. Get public URL
5. Create thumbnail (server-side)
6. Store URLs in database

### Voting Logic

- One vote per user per item per type
- Upsert on vote change
- Delete on vote removal
- Aggregate scores in real-time

### Map Markers

- Cluster nearby shops
- Color-code by crypto types
- Show shop info on click
- Link to detail page

---

## API Route Examples

### GET /api/shops

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '10'
  
  const supabase = createClient()
  
  if (lat && lng) {
    const { data, error } = await supabase
      .rpc('get_nearby_shops', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_km: parseFloat(radius)
      })
    
    return Response.json({ data, error })
  }
  
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
  
  return Response.json({ data, error })
}
```

### POST /api/submissions

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      ...body,
      submitted_by: user?.id || null,
      status: 'pending'
    })
    .select()
    .single()
  
  return Response.json({ data, error })
}
```

### POST /api/votes

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  const { data, error } = await supabase
    .from('votes')
    .upsert({
      ...body,
      user_id: user.id
    })
    .select()
    .single()
  
  return Response.json({ data, error })
}
```

---

## Testing Strategy

### Unit Tests
- Utility functions
- Validation logic
- Data transformations

### Integration Tests
- API routes
- Database operations
- Authentication flow

### E2E Tests
- User submission flow
- Admin approval flow
- Voting and commenting
- Map interactions

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Auth configured
- [ ] PWA manifest valid
- [ ] Images optimized
- [ ] API routes tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] SEO metadata added
- [ ] Analytics configured
- [ ] Error tracking set up

---

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Core Web Vitals**: All green
- **Bundle Size**: < 200KB (initial)

---

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs
   - Validate file uploads
   - Check coordinate bounds

2. **Rate Limiting**
   - Limit submissions per IP
   - Throttle API requests
   - Prevent spam voting

3. **Authentication**
   - Verify user sessions
   - Check admin privileges
   - Secure API routes

4. **Data Protection**
   - Use RLS policies
   - Encrypt sensitive data
   - Sanitize SQL queries

---

## Monitoring & Maintenance

### Metrics to Track
- User registrations
- Shop submissions
- Approval rate
- Vote activity
- Comment activity
- API response times
- Error rates

### Regular Tasks
- Review pending submissions
- Monitor user reports
- Update crypto types list
- Optimize database queries
- Review security logs

---

## Future Enhancements

### Phase 2 Features
- Shop owner verification
- Advanced search filters
- Social sharing
- Email notifications
- User reputation system

### Phase 3 Features
- Mobile native apps
- Payment integration
- Loyalty rewards
- Multi-language support
- Advanced analytics

---

## Support & Documentation

### User Documentation
- How to submit a shop
- How to vote and comment
- How to use the map
- FAQ section

### Developer Documentation
- API documentation
- Database schema
- Deployment guide
- Contributing guidelines

---

## License

This project will be open source. Recommended license: MIT

Include LICENSE file with:
- Permission to use, copy, modify
- Attribution requirement
- No warranty disclaimer