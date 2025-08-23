-- Temporarily disable RLS on transactions table to allow access
-- This is a temporary fix while we implement proper authentication integration

ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;