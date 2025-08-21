-- Security fix: Update subscribers table and RLS policies
-- Issue: Email-based access could be exploited by attackers who know user emails

-- First, update any existing records that might have NULL user_id
-- This ensures all records have proper user_id before making it NOT NULL
UPDATE public.subscribers 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email = subscribers.email
  LIMIT 1
)
WHERE user_id IS NULL;

-- Make user_id NOT NULL for better security
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

-- Create secure policies that only use user_id authentication
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add a unique constraint on user_id to prevent duplicate subscriptions per user
ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);