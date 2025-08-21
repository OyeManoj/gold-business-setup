-- Create user roles system for multi-tenant management
CREATE TYPE public.app_role AS ENUM ('admin', 'business_owner', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin dashboard stats view
CREATE VIEW public.admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.business_profiles) as total_businesses,
  (SELECT COUNT(*) FROM public.transactions) as total_transactions,
  (SELECT COUNT(*) FROM public.transactions WHERE created_at >= CURRENT_DATE) as today_transactions;

-- Create business analytics view
CREATE VIEW public.business_analytics AS
SELECT 
  bp.name as business_name,
  bp.user_id,
  bp.created_at as business_created,
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_amount,
  MAX(t.created_at) as last_transaction
FROM public.business_profiles bp
LEFT JOIN public.transactions t ON bp.user_id = t.user_id
GROUP BY bp.id, bp.name, bp.user_id, bp.created_at;

-- RLS for views (admins only)
CREATE POLICY "Admins can view admin_stats" 
ON public.admin_stats 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view business_analytics" 
ON public.business_analytics 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));