import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  userIdPin: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (userIdPin: string, pinCode: string) => Promise<{ error: any }>;
  signUp: (userIdPin: string, pinCode: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (userIdPin: string, pinCode: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_user', {
        user_id_pin: userIdPin,
        pin_code: pinCode
      });

      if (error) {
        return { error: { message: 'Authentication failed' } };
      }

      if (data && data.length > 0 && data[0].success) {
        const authUser: AuthUser = {
          id: data[0].user_id,
          userIdPin: userIdPin
        };
        setUser(authUser);
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        return { error: null };
      } else {
        return { error: { message: 'Invalid User ID or PIN' } };
      }
    } catch (error) {
      return { error: { message: 'Authentication failed' } };
    }
  };

  const signUp = async (userIdPin: string, pinCode: string) => {
    try {
      const { data, error } = await supabase.rpc('register_user', {
        user_id_pin: userIdPin,
        pin_code: pinCode
      });

      if (error) {
        return { error: { message: 'Registration failed' } };
      }

      if (data && data.length > 0 && data[0].success) {
        const authUser: AuthUser = {
          id: data[0].user_id,
          userIdPin: userIdPin
        };
        setUser(authUser);
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        return { error: null };
      } else {
        return { error: { message: data[0]?.message || 'Registration failed' } };
      }
    } catch (error) {
      return { error: { message: 'Registration failed' } };
    }
  };

  const signOut = async () => {
    // Clear all sensitive data from localStorage
    const keysToRemove = ['auth_user', 'business_profile', 'receipt_settings', 'gold_transactions'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};