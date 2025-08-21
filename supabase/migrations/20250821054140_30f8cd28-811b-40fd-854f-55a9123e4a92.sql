-- Fix RLS policies for subscribers table to be more restrictive
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create restrictive RLS policies for subscribers
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

-- Make user_id NOT NULL for transactions table (after updating any null values)
UPDATE public.transactions SET user_id = auth.uid() WHERE user_id IS NULL;
ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;

-- Make user_id NOT NULL for business_profiles table  
UPDATE public.business_profiles SET user_id = auth.uid() WHERE user_id IS NULL;
ALTER TABLE public.business_profiles ALTER COLUMN user_id SET NOT NULL;

-- Add updated_at triggers for proper timestamp management
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add CHECK constraints for data validation
ALTER TABLE public.transactions 
ADD CONSTRAINT check_weight_positive CHECK (weight > 0),
ADD CONSTRAINT check_purity_range CHECK (purity >= 0 AND purity <= 100),
ADD CONSTRAINT check_rate_positive CHECK (rate > 0),
ADD CONSTRAINT check_fine_gold_positive CHECK (fine_gold >= 0),
ADD CONSTRAINT check_amount_positive CHECK (amount >= 0);

-- Add constraint for reduction percentage if present
ALTER TABLE public.transactions 
ADD CONSTRAINT check_reduction_range CHECK (reduction IS NULL OR (reduction >= 0 AND reduction <= 100));