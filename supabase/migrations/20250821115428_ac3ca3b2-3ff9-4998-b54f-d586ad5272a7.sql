-- Create a custom users table for 4-digit ID and PIN authentication
CREATE TABLE public.custom_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE CHECK (LENGTH(user_id) = 4 AND user_id ~ '^[0-9]+$'),
  pin TEXT NOT NULL CHECK (LENGTH(pin) = 4 AND pin ~ '^[0-9]+$'),
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;

-- Create policy for login verification (public read for authentication)
CREATE POLICY "Allow login verification" 
ON public.custom_users 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_users_updated_at
BEFORE UPDATE ON public.custom_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample users for testing
INSERT INTO public.custom_users (user_id, pin, name) VALUES 
('1001', '1234', 'Admin User'),
('1002', '5678', 'Manager User'),
('1003', '9999', 'Employee User');