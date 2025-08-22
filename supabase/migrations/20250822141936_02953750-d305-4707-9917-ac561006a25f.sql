-- Enable real-time updates for user_sessions table
ALTER TABLE user_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;