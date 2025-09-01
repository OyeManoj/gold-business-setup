import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BusinessProfile {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export function useAppTitle() {
  const { user } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get app title - business name if exists, otherwise "Gold Ease"
  const appTitle = businessProfile?.name || 'Gold Ease';
  const defaultTitle = 'Gold Ease';

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_business_profile', {
          input_user_id: user.id
        });

        if (!error && data?.success && data.profile) {
          setBusinessProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user?.id]);

  // Refresh business profile data
  const refreshBusinessProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_user_business_profile', {
        input_user_id: user.id
      });

      if (!error && data?.success && data.profile) {
        setBusinessProfile(data.profile);
      } else {
        setBusinessProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing business profile:', error);
    }
  };

  return {
    appTitle,
    defaultTitle,
    businessProfile,
    isLoading,
    refreshBusinessProfile,
    hasBusinessProfile: !!businessProfile
  };
}