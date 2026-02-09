-- 007: Roles & Invitations
-- Adds role system (superadmin, admin, user) and invitation flow

-- Enable pgcrypto for gen_random_bytes (used for invite tokens)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ===================
-- ADD COLUMNS TO PROFILES
-- ===================
ALTER TABLE public.profiles
  ADD COLUMN role text NOT NULL DEFAULT 'admin'
    CHECK (role IN ('superadmin', 'admin', 'user')),
  ADD COLUMN is_superadmin boolean NOT NULL DEFAULT false,
  ADD COLUMN permissions jsonb NOT NULL DEFAULT '{"can_delete":false,"can_access_settings":false,"can_see_pricing":false,"read_only":false}'::jsonb,
  ADD COLUMN invited_by uuid REFERENCES public.profiles(id);

-- ===================
-- CREATE INVITATIONS TABLE
-- ===================
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  permissions jsonb NOT NULL DEFAULT '{"can_delete":false,"can_access_settings":false,"can_see_pricing":false,"read_only":false}'::jsonb,
  invited_by uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- ===================
-- UPDATE RLS ON PROFILES
-- ===================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users can see all profiles in their org (for team list) + superadmin sees all
CREATE POLICY "Users can view org profiles" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can update user profiles in their org (for permissions)
CREATE POLICY "Admins can update org user profiles" ON public.profiles FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ===================
-- RLS ON INVITATIONS
-- ===================
CREATE POLICY "Admins can view org invitations" ON public.invitations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

CREATE POLICY "Admins can create invitations" ON public.invitations FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

CREATE POLICY "Admins can update invitations" ON public.invitations FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- ===================
-- SUPERADMIN CROSS-ORG READ ON ORGANIZATIONS
-- ===================
CREATE POLICY "Superadmins can view all organizations" ON public.organizations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_superadmin = true));
