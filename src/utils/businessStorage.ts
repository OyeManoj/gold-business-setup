import { BusinessProfile } from '@/types/business';

const BUSINESS_STORAGE_KEY = 'business_profile';

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  // Local-only storage for security - no cloud database exposure
  localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(profile));
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  // Local-only storage for security
  const stored = localStorage.getItem(BUSINESS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    name: '',
    phone: '',
    address: ''
  };
}