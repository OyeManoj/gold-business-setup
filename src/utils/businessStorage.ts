import { BusinessProfile } from '@/types/business';

const BUSINESS_STORAGE_KEY = 'business_profile';

export function saveBusinessProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save business profile:', error);
  }
}

export function getBusinessProfile(): BusinessProfile {
  try {
    const stored = localStorage.getItem(BUSINESS_STORAGE_KEY);
    if (!stored) {
      return {
        name: '',
        phone: '',
        address: ''
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load business profile:', error);
    return {
      name: '',
      phone: '',
      address: ''
    };
  }
}