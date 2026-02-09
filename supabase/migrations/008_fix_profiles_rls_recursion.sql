-- 008: Fix infinite recursion in profiles RLS policy
-- The "Users can view org profiles" policy referenced profiles in its own
-- subquery, causing infinite recursion. Fix: use security-definer helper functions.

-- Helper function to get the current user's org_id (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function to check if current user is superadmin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_superadmin, false) FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function to get current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'admin') FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Users can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update org user profiles" ON public.profiles;

-- Recreate SELECT policy using helper functions (no recursion)
CREATE POLICY "Users can view org profiles" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR organization_id = public.get_my_org_id()
    OR public.is_superadmin()
  );

-- Recreate admin UPDATE policy using helper function
CREATE POLICY "Admins can update org user profiles" ON public.profiles FOR UPDATE
  USING (
    organization_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin', 'superadmin')
  );

-- Also fix invitation policies that reference profiles (not recursive but cleaner)
DROP POLICY IF EXISTS "Admins can view org invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.invitations;

CREATE POLICY "Admins can view org invitations" ON public.invitations FOR SELECT
  USING (
    organization_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin', 'superadmin')
  );

CREATE POLICY "Admins can create invitations" ON public.invitations FOR INSERT
  WITH CHECK (
    organization_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin', 'superadmin')
  );

CREATE POLICY "Admins can update invitations" ON public.invitations FOR UPDATE
  USING (
    organization_id = public.get_my_org_id()
    AND public.get_my_role() IN ('admin', 'superadmin')
  );

-- Fix superadmin org policy
DROP POLICY IF EXISTS "Superadmins can view all organizations" ON public.organizations;

CREATE POLICY "Superadmins can view all organizations" ON public.organizations FOR SELECT
  USING (public.is_superadmin());
