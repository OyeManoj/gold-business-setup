import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  userId: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (userId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('goldease_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('goldease_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userId: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate input format
      if (!/^\d{4}$/.test(userId) || !/^\d{4}$/.test(pin)) {
        return { success: false, error: 'User ID and PIN must be 4 digits' };
      }

      // Query the custom_users table
      const { data, error } = await supabase
        .from('custom_users')
        .select('id, user_id, name')
        .eq('user_id', userId)
        .eq('pin', pin)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid User ID or PIN' };
      }

      // Update last login
      await supabase
        .from('custom_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      const userData: User = {
        id: data.id,
        userId: data.user_id,
        name: data.name || 'User'
      };

      setUser(userData);
      localStorage.setItem('goldease_user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goldease_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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