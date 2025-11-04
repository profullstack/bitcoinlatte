-- BitcoinLatte Initial Database Schema Migration

-- Enable UUID extension (pgcrypto is preferred over uuid-ossp in modern PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shops table
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

-- Create submissions table
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

-- Create shop_images table
CREATE TABLE public.shop_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submission_images table
CREATE TABLE public.submission_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
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

-- Create votes table
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

-- Create indexes for performance
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX idx_shops_location ON public.shops(latitude, longitude);
CREATE INDEX idx_shops_approved ON public.shops(approved);
CREATE INDEX idx_shops_created_at ON public.shops(created_at);
CREATE INDEX idx_shops_location_crypto ON public.shops USING GIN (crypto_accepted);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at);
CREATE INDEX idx_shop_images_shop_id ON public.shop_images(shop_id);
CREATE INDEX idx_shop_images_is_primary ON public.shop_images(is_primary);
CREATE INDEX idx_submission_images_submission_id ON public.submission_images(submission_id);
CREATE INDEX idx_comments_shop_id ON public.comments(shop_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at);
CREATE INDEX idx_comments_shop_recent ON public.comments(shop_id, created_at DESC);
CREATE INDEX idx_votes_shop_id ON public.votes(shop_id);
CREATE INDEX idx_votes_submission_id ON public.votes(submission_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_aggregation ON public.votes(shop_id, vote_type, value);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate shop score
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
  FROM public.votes
  WHERE shop_id = shop_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get nearby shops
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
  FROM public.shops s
  WHERE s.approved = TRUE
  HAVING distance_km <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;