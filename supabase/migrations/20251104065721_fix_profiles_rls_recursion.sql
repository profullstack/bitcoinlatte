-- Fix infinite recursion in profiles RLS policies
-- This migration creates a SECURITY DEFINER function to check admin status
-- and updates all policies that check admin status to use this function

-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Drop and recreate profiles policies that check admin status
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Drop and recreate shops policies that check admin status
DROP POLICY IF EXISTS "Admins can insert shops" ON public.shops;
CREATE POLICY "Admins can insert shops"
  ON public.shops FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update shops" ON public.shops;
CREATE POLICY "Admins can update shops"
  ON public.shops FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete shops" ON public.shops;
CREATE POLICY "Admins can delete shops"
  ON public.shops FOR DELETE
  USING (public.is_admin());

-- Drop and recreate submissions policies that check admin status
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.submissions;
CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;
CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete submissions" ON public.submissions;
CREATE POLICY "Admins can delete submissions"
  ON public.submissions FOR DELETE
  USING (public.is_admin());

-- Drop and recreate shop_images policies that check admin status
DROP POLICY IF EXISTS "Image owner or admin can delete shop images" ON public.shop_images;
CREATE POLICY "Image owner or admin can delete shop images"
  ON public.shop_images FOR DELETE
  USING (
    auth.uid() = uploaded_by OR
    public.is_admin()
  );

-- Drop and recreate submission_images policies that check admin status
DROP POLICY IF EXISTS "Users can view images for their submissions" ON public.submission_images;
CREATE POLICY "Users can view images for their submissions"
  ON public.submission_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions
      WHERE id = submission_id AND (submitted_by = auth.uid() OR submitted_by IS NULL)
    ) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete submission images" ON public.submission_images;
CREATE POLICY "Admins can delete submission images"
  ON public.submission_images FOR DELETE
  USING (public.is_admin());

-- Drop and recreate comments policies that check admin status
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;
CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (public.is_admin());