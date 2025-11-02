# BitcoinLatte - Technical Architecture

## System Overview

BitcoinLatte is a location-based Progressive Web App (PWA) for discovering coffee shops that accept Bitcoin and cryptocurrency payments. Built with Next.js, Tailwind CSS, and Supabase.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js
- **Geocoding**: HERE.com API, ValueSERP (Google venue data)
- **PWA**: next-pwa

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Link)
- **Storage**: Supabase Storage
- **API**: Next.js API Routes (Server-side only)

## Architecture Diagram

![System Architecture](diagrams/system-architecture.puml)

> **Note**: View the PlantUML diagram at [`diagrams/system-architecture.puml`](diagrams/system-architecture.puml)

## Database Schema

![Database Schema](diagrams/database-schema.puml)

> **Note**: View the PlantUML diagram at [`diagrams/database-schema.puml`](diagrams/database-schema.puml)
>
> For detailed SQL schema, see [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md)

## Key Features

### 1. Shop Submission Flow
- Anonymous users can submit shops
- Address autocomplete via HERE.com
- Image upload to Supabase Storage
- Metadata collection (crypto types, hours, contact)
- Pending approval status

### 2. Admin Approval System
- Admin dashboard for reviewing submissions
- Approve/reject with notes
- Merge duplicate submissions
- Edit shop details

### 3. Authentication
- Magic link email authentication
- No passwords required
- Required for voting and commenting
- Admin flag for privileged users

### 4. Voting System
- Shop quality votes (upvote/downvote)
- Bitcoin acceptance verification votes
- Submission accuracy votes
- One vote per user per item

### 5. Commenting System
- Comments on shops
- Comments on Bitcoin acceptance
- Threaded discussions
- Moderation by admins

### 6. Map Integration
- Interactive Leaflet.js map
- Cluster markers for dense areas
- Filter by crypto type
- Search by location
- Direction links to Apple/Google Maps

### 7. PWA Features
- Offline map caching
- Install to home screen
- Push notifications (optional)
- Fast loading with service worker

## API Routes Structure

```
/api/
├── shops/
│   ├── route.ts (GET list, POST create)
│   ├── [id]/route.ts (GET, PATCH, DELETE)
│   └── nearby/route.ts (GET by location)
├── submissions/
│   ├── route.ts (GET list, POST create)
│   ├── [id]/route.ts (GET, PATCH, DELETE)
│   └── approve/route.ts (POST approve/reject)
├── comments/
│   ├── route.ts (GET list, POST create)
│   └── [id]/route.ts (GET, PATCH, DELETE)
├── votes/
│   ├── route.ts (POST vote)
│   └── [id]/route.ts (DELETE)
├── images/
│   ├── upload/route.ts (POST)
│   └── [id]/route.ts (DELETE)
├── geocode/
│   └── route.ts (GET address suggestions)
└── auth/
    └── callback/route.ts (magic link callback)
```

## Security Considerations

### Row Level Security (RLS)
- Users can only edit their own submissions
- Admins can edit all content
- Public read access for approved shops
- Authenticated read for pending submissions

### Image Upload
- File size limits (5MB per image)
- Allowed formats: JPEG, PNG, WebP
- Automatic resizing and optimization
- Virus scanning (optional)

### Rate Limiting
- Submission rate limits per IP
- Vote rate limits per user
- Comment rate limits per user

## Deployment

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
HERE_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Hosting Options
- **Recommended**: Vercel (optimal Next.js support)
- **Alternative**: Netlify, Railway, or self-hosted

### CI/CD
- Automatic deployments from main branch
- Preview deployments for PRs
- Environment-specific configurations

## Performance Optimization

### Image Optimization
- Next.js Image component
- Supabase Storage transformations
- WebP format with fallbacks
- Lazy loading

### Caching Strategy
- Static page generation where possible
- ISR for shop listings
- Client-side caching with SWR
- Service worker caching for PWA

### Database Optimization
- Indexes on frequently queried fields
- Materialized views for aggregations
- Connection pooling
- Query optimization

## Monitoring & Analytics

### Error Tracking
- Sentry or similar service
- Server-side error logging
- Client-side error boundaries

### Analytics
- Privacy-focused analytics (Plausible/Fathom)
- User behavior tracking
- Performance monitoring
- Conversion tracking

## Future Enhancements

- Multi-language support
- Shop owner verification
- Loyalty rewards program
- Social sharing features
- Advanced search filters
- Mobile native apps
- Integration with Bitcoin payment processors