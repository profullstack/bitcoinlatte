# BitcoinLatte Database Schema

## Overview

This document defines the complete database schema for the BitcoinLatte application using PostgreSQL (Supabase).

## Tables

### users (extends auth.users)

Extended user profile information.

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_profiles_is_admin` on `is_admin`

**RLS Policies:**
- Public read access
- Users can update their own profile
- Admins can update any profile

---

### shops

Approved coffee shops that accept Bitcoin/crypto.

```sql
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  crypto_accepted JSONB DEFAULT '[]'::jsonb,
  website TEXT,
  phone TEXT,
  hours JSONB,
  approved BOOLEAN DEFAULT FALSE,
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);
```

**crypto_accepted format:**
```json
["BTC", "ETH", "LTC", "Lightning"]
```

**hours format:**
```json
{
  "monday": {"open": "08:00", "close": "18:00"},
  "tuesday": {"open": "08:00", "close": "18:00"},
  "wednesday": {"open": "08:00", "close": "18:00"},
  "thursday": {"open": "08:00", "close": "18:00"},
  "friday": {"open": "08:00", "close": "18:00"},
  "saturday": {"open": "09:00", "close": "17:00"},
  "sunday": {"closed": true}
}
```

**Indexes:**
- `idx_shops_location` on `latitude, longitude` (for geospatial queries)
- `idx_shops_approved` on `approved`
- `idx_shops_created_at` on `created_at`

**RLS Policies:**
- Public read access for approved shops
- Authenticated users can read all shops
- Admins can insert/update/delete

---

### submissions

Pending shop submissions awaiting approval.

```sql
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  crypto_accepted JSONB DEFAULT '[]'::jsonb,
  website TEXT,
  phone TEXT,
  hours JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);
```

**Indexes:**
- `idx_submissions_status` on `status`
- `idx_submissions_submitted_by` on `submitted_by`
- `idx_submissions_created_at` on `created_at`

**RLS Policies:**
- Users can read their own submissions
- Admins can read all submissions
- Anyone can insert (anonymous submissions allowed)
- Admins can update/delete

---

### shop_images

Images associated with approved shops.

```sql
CREATE TABLE public.shop_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_shop_images_shop_id` on `shop_id`
- `idx_shop_images_is_primary` on `is_primary`

**RLS Policies:**
- Public read access
- Authenticated users can insert
- Image owner or admin can delete

---

### submission_images

Images associated with pending submissions.

```sql
CREATE TABLE public.submission_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_submission_images_submission_id` on `submission_id`

**RLS Policies:**
- Users can read images for their submissions
- Admins can read all
- Anyone can insert
- Admins can delete

---

### comments

User comments on shops.

```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general' CHECK (comment_type IN ('general', 'bitcoin_experience', 'review')),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);
```

**Indexes:**
- `idx_comments_shop_id` on `shop_id`
- `idx_comments_user_id` on `user_id`
- `idx_comments_parent_id` on `parent_id`
- `idx_comments_created_at` on `created_at`

**RLS Policies:**
- Public read access
- Authenticated users can insert
- Comment owner can update/delete their own
- Admins can delete any

---

### votes

User votes on shops and submissions.

```sql
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('shop_quality', 'bitcoin_verified', 'submission_accuracy')),
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT vote_target CHECK (
    (shop_id IS NOT NULL AND submission_id IS NULL) OR
    (shop_id IS NULL AND submission_id IS NOT NULL)
  ),
  CONSTRAINT unique_user_vote UNIQUE (user_id, shop_id, submission_id, vote_type)
);
```

**Indexes:**
- `idx_votes_shop_id` on `shop_id`
- `idx_votes_submission_id` on `submission_id`
- `idx_votes_user_id` on `user_id`

**RLS Policies:**
- Public read access (aggregated)
- Authenticated users can insert/update their own votes
- Users can delete their own votes

---

## Storage Buckets

### shop-images

Stores shop and submission images.

**Configuration:**
- Public: false
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

**Policies:**
- Anyone can upload (with rate limiting)
- Public read access
- Owner or admin can delete

---

## Functions

### update_updated_at_column()

Trigger function to automatically update `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Applied to:**
- shops
- profiles
- comments

---

### calculate_shop_score()

Calculate aggregate score for a shop based on votes.

```sql
CREATE OR REPLACE FUNCTION calculate_shop_score(shop_uuid UUID)
RETURNS TABLE(
  quality_score INTEGER,
  bitcoin_verified_score INTEGER,
  total_votes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN vote_type = 'shop_quality' THEN value ELSE 0 END), 0)::INTEGER,
    COALESCE(SUM(CASE WHEN vote_type = 'bitcoin_verified' THEN value ELSE 0 END), 0)::INTEGER,
    COUNT(*)::INTEGER
  FROM votes
  WHERE shop_id = shop_uuid;
END;
$$ LANGUAGE plpgsql;
```

---

### get_nearby_shops()

Get shops within a radius of a location.

```sql
CREATE OR REPLACE FUNCTION get_nearby_shops(
  lat DECIMAL,
  lng DECIMAL,
  radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.address,
    s.latitude,
    s.longitude,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(s.latitude)) *
        cos(radians(s.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(s.latitude))
      )
    )::DECIMAL AS distance_km
  FROM shops s
  WHERE s.approved = TRUE
  HAVING distance_km <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

```sql
-- Auto-update updated_at on shops
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on comments
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS) Policies

### profiles

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### shops

```sql
-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Public can view approved shops
CREATE POLICY "Approved shops are viewable by everyone"
  ON shops FOR SELECT
  USING (approved = true);

-- Authenticated users can view all shops
CREATE POLICY "Authenticated users can view all shops"
  ON shops FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can insert shops
CREATE POLICY "Admins can insert shops"
  ON shops FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update shops
CREATE POLICY "Admins can update shops"
  ON shops FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can delete shops
CREATE POLICY "Admins can delete shops"
  ON shops FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### submissions

```sql
-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert submissions
CREATE POLICY "Anyone can submit shops"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  USING (submitted_by = auth.uid());

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update submissions
CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### comments

```sql
-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### votes

```sql
-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public can view aggregated votes
CREATE POLICY "Vote counts are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own votes
CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own votes
CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Initial Data

### Crypto Types Reference

Common cryptocurrency types to support:

- BTC (Bitcoin)
- Lightning (Lightning Network)
- ETH (Ethereum)
- USDC (USD Coin)
- USDT (Tether)
- LTC (Litecoin)
- BCH (Bitcoin Cash)
- DOGE (Dogecoin)

---

## Migration Order

1. Create profiles table
2. Create shops table
3. Create submissions table
4. Create shop_images table
5. Create submission_images table
6. Create comments table
7. Create votes table
8. Create functions
9. Create triggers
10. Enable RLS and create policies
11. Create storage buckets and policies

---

## Indexes for Performance

Additional composite indexes for common queries:

```sql
-- Shops by location and crypto type
CREATE INDEX idx_shops_location_crypto ON shops 
  USING GIN (crypto_accepted);

-- Recent comments
CREATE INDEX idx_comments_shop_recent ON comments (shop_id, created_at DESC);

-- Vote aggregation
CREATE INDEX idx_votes_aggregation ON votes (shop_id, vote_type, value);
```

---

## Backup and Maintenance

### Recommended Backup Strategy
- Daily automated backups via Supabase
- Point-in-time recovery enabled
- Weekly manual backup verification

### Maintenance Tasks
- Monthly VACUUM ANALYZE on all tables
- Quarterly index rebuild
- Regular monitoring of table sizes and query performance