import { useEffect, useState } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  role: 'admin' | 'business_owner' | 'user';
}

export function useAuth() {
  const { user, session, loading, signIn, signUp, signOut } = useAuthContext();
  const [userRole, setUserRole] = useState<'admin' | 'business_owner' | 'user' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error fetching user role:', error);
        }

        setUserRole(data?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole === 'admin';
  const isBusinessOwner = userRole === 'business_owner';

  return {
    user,
    session,
    loading: loading || roleLoading,
    userRole,
    isAdmin,
    isBusinessOwner,
    signIn,
    signUp,
    signOut,
  };
}