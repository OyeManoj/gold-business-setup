import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (userId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
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

      // Call the secure verification function
      const { data, error } = await supabase.rpc('verify_login_credentials', {
        input_user_id: userId,
        input_pin: pin
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Authentication failed' };
      }

      if (data?.success) {
        const userData: User = {
          id: data.user.id,
          userId: data.user.user_id,
          name: data.user.name || 'User',
          role: data.user.role as 'admin' | 'employee'
        };

        setUser(userData);
        localStorage.setItem('goldease_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: data?.error || 'Invalid User ID or PIN' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goldease_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Define employee restrictions
    if (user.role === 'employee') {
      const restrictedPermissions = ['history'];
      return !restrictedPermissions.includes(permission);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
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