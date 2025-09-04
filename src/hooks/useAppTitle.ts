import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getReceiptSettings } from '@/utils/receiptSettingsStorage';

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
  const [useBusinessNameAsTitle, setUseBusinessNameAsTitle] = useState(true);

  // Get app title - business name if setting is enabled and profile exists, otherwise "Gold Ease"
  const appTitle = (useBusinessNameAsTitle && businessProfile?.name) ? businessProfile.name : 'Gold Ease';
  const defaultTitle = 'Gold Ease';

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch business profile
        const { data, error } = await supabase.rpc('get_user_business_profile', {
          input_user_id: user.user_id
        });

        if (!error && data?.success && data.profile) {
          setBusinessProfile(data.profile);
        }

        // Fetch receipt settings to check app title preference
        const settings = await getReceiptSettings();
        setUseBusinessNameAsTitle(settings.useBusinessNameAsAppTitle);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id]);

  // Refresh business profile data
  const refreshBusinessProfile = async () => {
    if (!user?.user_id) return;

    try {
      const { data, error } = await supabase.rpc('get_user_business_profile', {
        input_user_id: user.user_id
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