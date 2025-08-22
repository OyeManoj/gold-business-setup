-- Enable real-time updates for transactions table
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;