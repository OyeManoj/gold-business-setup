import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  signUpWithPin: (name: string, pin: string, role?: 'admin' | 'employee') => Promise<{ error?: string; userId?: string }>;
  signInWithPin: (userId: string, pin: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing custom user session
    const checkExistingUser = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser({ 
            id: userData.id, 
            email: `${userData.user_id}@local`, 
            created_at: userData.created_at || new Date().toISOString()
          } as User);
          setProfile({
            id: userData.id,
            name: userData.name,
            role: userData.role
          });
        } catch (error) {
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };

    checkExistingUser();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUpWithPin = async (name: string, pin: string, role: 'admin' | 'employee' = 'employee') => {
    try {
      // Call the Supabase function to register user
      const { data, error } = await supabase.rpc('register_custom_user', {
        input_name: name,
        input_pin: pin,
        input_role: role
      });

      if (error) {
        return { error: error.message };
      }

      if (!data?.success) {
        return { error: data?.error || 'Registration failed' };
      }

      // Create a dummy session for the custom user
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      // Set user state to simulate authenticated state
      setUser({ 
        id: data.user.id, 
        email: `${data.user.user_id}@local`, 
        created_at: data.user.created_at 
      } as User);
      setProfile({
        id: data.user.id,
        name: data.user.name,
        role: data.user.role
      });

      return { userId: data.user_id };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signInWithPin = async (userId: string, pin: string) => {
    try {
      // Call the Supabase function to verify credentials
      const { data, error } = await supabase.rpc('verify_login_credentials', {
        input_user_id: userId,
        input_pin: pin
      });

      if (error) {
        return { error: error.message };
      }

      if (!data?.success) {
        return { error: data?.error || 'Invalid credentials' };
      }

      // Store user info and simulate authenticated state
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      setUser({ 
        id: data.user.id, 
        email: `${data.user.user_id}@local`, 
        created_at: new Date().toISOString() 
      } as User);
      setProfile({
        id: data.user.id,
        name: data.user.name,
        role: data.user.role
      });

      return {};
    } catch (error: any) {
      return { error: error.message };
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
      setSession(null);
      setProfile(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error signing out:', error);
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
      session,
      profile, 
      signUpWithPin, 
      signInWithPin, 
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