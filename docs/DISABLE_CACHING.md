# Disabling Caching in Next.js

This guide explains how to completely disable caching in your Next.js application for development or debugging purposes.

## Overview

Next.js has multiple caching layers:
1. **Data Cache** - Caches fetch requests
2. **Full Route Cache** - Caches rendered pages
3. **Router Cache** - Client-side navigation cache
4. **Image Optimization Cache** - Optimized images

## Configuration Changes

### 1. Next.js Config (`next.config.js`)

Already configured with:
- `experimental.isrMemoryCacheSize: 0` - Disables ISR cache
- `images.unoptimized: true` - Disables image optimization (when DISABLE_CACHE=true)

### 2. Environment Variable

Add to your `.env.local`:
```bash
DISABLE_CACHE=true
```

### 3. Layout Configuration (`src/app/layout.tsx`)

Add these exports to disable route caching:

```typescript
// Disable all caching for this route segment
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 4. API Routes

For each API route, add:

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 5. Fetch Requests

Disable caching on individual fetch calls:

```typescript
// Option 1: No cache
fetch(url, { cache: 'no-store' })

// Option 2: Revalidate on every request
fetch(url, { next: { revalidate: 0 } })
```

### 6. Client-Side Router Cache

In your root layout, add headers to disable client-side caching:

```typescript
export const metadata = {
  // ... other metadata
}

// Add these headers
export const headers = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}
```

### 7. Service Worker (PWA)

Your PWA service worker is already disabled in development:
```javascript
disable: process.env.NODE_ENV === "development"
```

For production, you may want to disable it entirely or configure it to not cache:

```javascript
// In next.config.js
module.exports = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.DISABLE_CACHE === 'true' || process.env.NODE_ENV === "development",
})(nextConfig);
```

## Complete Implementation Steps

### Step 1: Update Root Layout

```typescript
// src/app/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootLayout({ children }) {
  // ... your layout code
}
```

### Step 2: Update All API Routes

Add to each route file in `src/app/api/`:

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### Step 3: Update Page Routes

Add to each page that needs no caching:

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### Step 4: Update Fetch Calls

Replace all fetch calls:

```typescript
// Before
const data = await fetch(url)

// After
const data = await fetch(url, { cache: 'no-store' })
```

### Step 5: Clear Build Cache

```bash
# Remove Next.js cache
rm -rf .next

# Remove node_modules cache (if needed)
rm -rf node_modules/.cache

# Rebuild
pnpm install
pnpm dev
```

## Browser Cache Control

Add these headers in your middleware or API responses:

```typescript
headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
headers.set('Pragma', 'no-cache')
headers.set('Expires', '0')
```

## Verification

To verify caching is disabled:

1. **Network Tab**: Check browser DevTools Network tab - should see `(disk cache)` or `(memory cache)` disappear
2. **Response Headers**: Should see `Cache-Control: no-store`
3. **Data Updates**: Changes should reflect immediately without hard refresh

## Performance Impact

⚠️ **Warning**: Disabling all caching will:
- Increase server load
- Slow down page loads
- Increase bandwidth usage
- Reduce user experience

**Recommendation**: Only disable caching during development/debugging. Re-enable for production.

## Selective Caching

Instead of disabling everything, consider selective caching:

```typescript
// Cache static data for 1 hour
fetch(url, { next: { revalidate: 3600 } })

// No cache for dynamic data
fetch(url, { cache: 'no-store' })

// Cache until manually revalidated
fetch(url, { next: { tags: ['shop-data'] } })
```

## Troubleshooting

### Cache Still Present

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Delete `.next` folder and rebuild
4. Check for service worker in DevTools > Application > Service Workers

### Build Errors

If you get build errors after adding `dynamic = 'force-dynamic'`:
- Ensure you're using Next.js 13+ with App Router
- Check that exports are at the top level of the file
- Verify TypeScript types are correct

## References

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)