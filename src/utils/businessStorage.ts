import { BusinessProfile } from '@/types/business';
import { SecureStorage } from './encryption';
import { supabase } from '@/integrations/supabase/client';

const BUSINESS_STORAGE_KEY = 'business_profile';

// Get current user ID from Supabase
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  
  // Use secure encrypted storage
  await SecureStorage.setSecureItem(BUSINESS_STORAGE_KEY, profile, userId);
  
  // Keep fallback for compatibility
  localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(profile));
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const userId = await getCurrentUserId();
  
  // Try secure storage first
  if (userId) {
    const secureStored = await SecureStorage.getSecureItem<BusinessProfile>(BUSINESS_STORAGE_KEY, userId);
    if (secureStored) {
      return secureStored;
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(BUSINESS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    name: '',
    address: ''
  };
}