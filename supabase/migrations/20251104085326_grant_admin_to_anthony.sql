-- Grant admin privileges to anthony@profullstack.com
-- This migration updates the profiles table to set is_admin = true for the user with email 'anthony@profullstack.com'
-- This allows the user to access the admin dashboard at /admin

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'anthony@profullstack.com';