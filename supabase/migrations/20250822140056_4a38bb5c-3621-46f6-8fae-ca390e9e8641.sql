-- Create user_sessions table to track devices
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  device_name text,
  device_type text,
  browser_info text,
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user sessions
CREATE POLICY "Users can view sessions for their user ID" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = (
  SELECT user_id FROM custom_users WHERE id = auth.uid()
));

CREATE POLICY "Users can create their own sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (user_id = (
  SELECT user_id FROM custom_users WHERE id = auth.uid()
));

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (user_id = (
  SELECT user_id FROM custom_users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their own sessions" 
ON public.user_sessions 
FOR DELETE 
USING (user_id = (
  SELECT user_id FROM custom_users WHERE id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for user sessions
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE user_sessions;