import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomUser {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'employee';
  last_login?: string;
}

interface AuthContextType {
  user: CustomUser | null;
  signUp: (name: string, pin: string, role?: 'admin' | 'employee', userId?: string) => Promise<{ error?: string; user_id?: string }>;
  signIn: (userId: string, pin: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const signUp = async (name: string, pin: string, role: 'admin' | 'employee' = 'employee', userId?: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('register_custom_user', {
        input_name: name,
        input_pin: pin,
        input_role: role,
        input_user_id: userId
      });

      if (error) {
        return { error: error.message };
      }

      if (data.success) {
        return { user_id: data.user_id };
      } else {
        return { error: data.error };
      }
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userId: string, pin: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('verify_login_credentials', {
        input_user_id: userId,
        input_pin: pin
      });

      if (error) {
        return { error: error.message };
      }

      if (data.success) {
        const userData = data.user;
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return {};
      } else {
        return { error: data.error };
      }
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear secure offline data before signout
      if (user?.id) {
        const { SecureStorage } = await import('@/utils/encryption');
        SecureStorage.clearUserData(user.id);
      }
      
      // Clear local state
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Define employee restrictions (currently no restrictions)
    if (user.role === 'employee') {
      const restrictedPermissions: string[] = []; // No restrictions for employees
      return !restrictedPermissions.includes(permission);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signUp, 
      signIn, 
      signOut, 
      isLoading, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}