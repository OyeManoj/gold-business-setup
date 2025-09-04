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

  console.log('useAppTitle debug:', {
    useBusinessNameAsTitle,
    businessProfileName: businessProfile?.name,
    appTitle,
    businessProfile
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch business profile using string user_id (not UUID)
        const { data, error } = await supabase.rpc('get_user_business_profile', {
          input_user_id: user.user_id // This should be string like "1001"
        });

        console.log('Business profile fetch result:', { data, error, userId: user.user_id });

        if (!error && data?.success && data.profile) {
          setBusinessProfile(data.profile);
          console.log('Business profile set:', data.profile);
        } else {
          console.log('No business profile found or error:', { error, data });
        }

        // Fetch receipt settings to check app title preference
        const settings = await getReceiptSettings();
        console.log('Receipt settings loaded:', settings);
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
        input_user_id: user.user_id // String user_id like "1001"
      });

      console.log('Refresh business profile result:', { data, error, userId: user.user_id });

      if (!error && data?.success && data.profile) {
        setBusinessProfile(data.profile);
        console.log('Business profile refreshed:', data.profile);
      } else {
        setBusinessProfile(null);
        console.log('No business profile after refresh');
      }

      // Also refresh receipt settings when refreshing profile
      const settings = await getReceiptSettings();
      setUseBusinessNameAsTitle(settings.useBusinessNameAsAppTitle);
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
    hasBusinessProfile: !!businessProfile,
    refreshSettings: async () => {
      const settings = await getReceiptSettings();
      setUseBusinessNameAsTitle(settings.useBusinessNameAsAppTitle);
    }
  };
}