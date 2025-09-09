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
  signUp: (email: string, password: string, name: string, role?: 'admin' | 'employee') => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when session changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'employee' = 'employee') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name,
            role
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

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
      
      await supabase.auth.signOut();
      
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