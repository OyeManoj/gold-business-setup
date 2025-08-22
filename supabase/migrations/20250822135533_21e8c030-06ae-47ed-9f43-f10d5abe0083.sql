-- Enable Row Level Security on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (user_id = auth.uid());

-- Enable realtime for transactions
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Add transactions to realtime publication
ALTER publication supabase_realtime ADD TABLE transactions;