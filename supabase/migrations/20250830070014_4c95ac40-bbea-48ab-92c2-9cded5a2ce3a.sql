-- Grant execute permissions for verify_login_credentials to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_login_credentials(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_login_credentials(text, text) TO anon;