import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'employee';
}

interface CustomUser {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: CustomUser | null;
  profile: UserProfile | null;
  signUp: (name: string, pin: string, role?: 'admin' | 'employee') => Promise<{ error?: string; userId?: string }>;
  signIn: (userId: string, pin: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setProfile(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = async (name: string, pin: string, role: 'admin' | 'employee' = 'employee') => {
    try {
      // Generate a random 4-digit user ID
      const userId = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { data, error } = await supabase
        .from('custom_users')
        .insert({
          user_id: userId,
          pin: pin,
          name: name,
          role: role
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return { error: 'User ID already exists. Please try again.' };
        }
        return { error: error.message };
      }

      return { userId };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (userId: string, pin: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_login_credentials', {
        input_user_id: userId,
        input_pin: pin
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.success) {
        const userData = data.user;
        setUser(userData);
        setProfile(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return {};
      } else {
        return { error: 'Invalid credentials' };
      }
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    // Clear local user data
    setUser(null);
    setProfile(null);
    localStorage.removeItem('currentUser');
    
    // Clear all secure offline data
    if (user?.id) {
      const { SecureStorage } = await import('@/utils/encryption');
      SecureStorage.clearUserData(user.id);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Admin has all permissions
    if (profile.role === 'admin') return true;
    
    // Define employee restrictions
    if (profile.role === 'employee') {
      const restrictedPermissions = ['history'];
      return !restrictedPermissions.includes(permission);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
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