-- Fix the get_nearby_shops function to properly filter by distance
-- The original function had a HAVING clause without GROUP BY which caused error 42803

DROP FUNCTION IF EXISTS get_nearby_shops(DECIMAL, DECIMAL, DECIMAL);

CREATE OR REPLACE FUNCTION get_nearby_shops(
  lat DECIMAL,
  lng DECIMAL,
  radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  crypto_accepted JSONB,
  website TEXT,
  phone TEXT,
  hours JSONB,
  approved BOOLEAN,
  submitted_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.description,
    s.address,
    s.latitude,
    s.longitude,
    s.crypto_accepted,
    s.website,
    s.phone,
    s.hours,
    s.approved,
    s.submitted_by,
    s.approved_by,
    s.created_at,
    s.updated_at,
    calculated_distance.distance_km
  FROM public.shops s
  CROSS JOIN LATERAL (
    SELECT (
      6371 * acos(
        cos(radians(lat)) * cos(radians(s.latitude)) *
        cos(radians(s.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(s.latitude))
      )
    )::DECIMAL AS distance_km
  ) calculated_distance
  WHERE s.approved = TRUE
    AND calculated_distance.distance_km <= radius_km
  ORDER BY calculated_distance.distance_km;
END;
$$ LANGUAGE plpgsql;