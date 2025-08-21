-- Add auto-updating updated_at triggers for enhanced security auditing

-- Create triggers for transactions table
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create triggers for business_profiles table  
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();