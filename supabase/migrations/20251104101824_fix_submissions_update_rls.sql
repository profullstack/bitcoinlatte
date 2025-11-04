-- Fix RLS policy for submissions UPDATE to include WITH CHECK clause
-- This allows admins to actually update submission status (approve/reject)

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;

-- Recreate with both USING and WITH CHECK clauses
CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );