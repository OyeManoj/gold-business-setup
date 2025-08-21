import { BusinessProfile } from '@/types/business';
import { supabase } from '@/integrations/supabase/client';

const BUSINESS_STORAGE_KEY = 'business_profile';

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  try {
    const currentUser = localStorage.getItem('current_user');
    
    if (currentUser) {
      const user = JSON.parse(currentUser);
      // Save to Supabase (upsert - insert or update)
      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        });
      
      if (error) throw error;
    } else {
      // Fallback to localStorage if not authenticated
      localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(profile));
    }
  } catch (error) {
    console.error('Failed to save business profile:', error);
    // Fallback to localStorage on error
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(profile));
  }
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  try {
    const currentUser = localStorage.getItem('current_user');
    
    if (currentUser) {
      const user = JSON.parse(currentUser);
      // Get from Supabase
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      
      if (data) {
        return {
          name: data.name,
          phone: data.phone || '',
          address: data.address || ''
        };
      }
    }
    
    // Fallback to localStorage or default values
    const stored = localStorage.getItem(BUSINESS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      name: '',
      phone: '',
      address: ''
    };
  } catch (error) {
    console.error('Failed to load business profile:', error);
    // Fallback to localStorage on error
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
}