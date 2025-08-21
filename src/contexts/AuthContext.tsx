import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserAuth {
  id: string;
  user_id_pin: string;
}

interface AuthContextType {
  user: UserAuth | null;
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
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('current_user');
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
        return { error };
      }

      if (data && data.length > 0 && data[0].success) {
        const userData = { id: data[0].user_id, user_id_pin: userIdPin };
        setUser(userData);
        localStorage.setItem('current_user', JSON.stringify(userData));
        return { error: null };
      } else {
        return { error: { message: 'Invalid User ID or PIN' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (userIdPin: string, pinCode: string) => {
    try {
      const { data, error } = await supabase.rpc('register_user', {
        user_id_pin: userIdPin,
        pin_code: pinCode
      });

      if (error) {
        return { error };
      }

      if (data && data.length > 0 && data[0].success) {
        const userData = { id: data[0].user_id, user_id_pin: userIdPin };
        setUser(userData);
        localStorage.setItem('current_user', JSON.stringify(userData));
        return { error: null };
      } else {
        return { error: { message: data[0]?.message || 'Registration failed' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    // Clear all sensitive data from localStorage
    const keysToRemove = ['business_profile', 'receipt_settings', 'gold_transactions', 'current_user'];
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