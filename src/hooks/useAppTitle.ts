import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getReceiptSettings } from '@/utils/receiptSettingsStorage';
import { getBusinessProfile } from '@/utils/businessStorage';
import { BusinessProfile } from '@/types/business';

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
      try {
        // Fetch business profile from offline storage (works both online and offline)
        const profile = await getBusinessProfile();
        console.log('Business profile from storage:', profile);
        
        if (profile && profile.name) {
          setBusinessProfile(profile);
          console.log('Business profile set:', profile);
        } else {
          setBusinessProfile(null);
          console.log('No business profile found in storage');
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
  }, [user?.id]);

  // Refresh business profile data
  const refreshBusinessProfile = async () => {
    try {
      // Use offline storage for refresh too (works both online and offline)
      const profile = await getBusinessProfile();
      console.log('Refresh business profile from storage:', profile);
      
      if (profile && profile.name) {
        setBusinessProfile(profile);
        console.log('Business profile refreshed:', profile);
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