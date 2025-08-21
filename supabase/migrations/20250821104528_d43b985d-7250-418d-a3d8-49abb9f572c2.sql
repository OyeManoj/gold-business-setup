-- Phase 0: Immediate safety lockdown - Remove dangerous public policies
-- Drop all public "allow all" policies that expose data

DROP POLICY IF EXISTS "Public access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public access to business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Public access to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public access to user roles" ON public.user_roles;

-- Keep RLS enabled but with no policies = deny all access by default
-- This immediately locks down the database from public access

-- Only keep the subscription plans readable for public (if needed for pricing display)
-- The subscription_plans table can stay public since it's for displaying plans to potential users