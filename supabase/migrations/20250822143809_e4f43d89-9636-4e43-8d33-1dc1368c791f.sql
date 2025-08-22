-- Create audit logs table
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  custom_user_id text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  device_info jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  custom_user_id IS NOT NULL AND custom_user_id = (
    SELECT user_id FROM custom_users 
    WHERE id::uuid = auth.uid()
  )
);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM custom_users 
    WHERE id::uuid = auth.uid() 
    AND role = 'admin'
  )
);

-- Create index for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_custom_user_id ON public.audit_logs(custom_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);