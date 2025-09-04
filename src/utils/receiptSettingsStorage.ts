import { supabase } from '@/integrations/supabase/client';
import { ReceiptSettings } from '@/types/receiptSettings';
import { SecureStorage } from './encryption';

const STORAGE_KEY = 'receiptSettings';

const defaultSettings: ReceiptSettings = {
  showBusinessName: true,
  showBusinessAddress: false,
  useBusinessNameAsAppTitle: true,
};

export async function getReceiptSettings(): Promise<ReceiptSettings> {
  try {
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser) {
      // Return from localStorage if not authenticated
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    }

    const userData = JSON.parse(storedUser);
    
    // Try secure storage first
    const secureStored = await SecureStorage.getSecureItem<ReceiptSettings>(STORAGE_KEY, userData.id);
    if (secureStored) {
      return secureStored;
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  } catch (error) {
    console.error('Error loading receipt settings:', error);
    return defaultSettings;
  }
}

export async function saveReceiptSettings(settings: ReceiptSettings): Promise<void> {
  try {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Use secure encrypted storage
      await SecureStorage.setSecureItem(STORAGE_KEY, settings, userData.id);
    }
    
    // Save to localStorage as fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving receipt settings:', error);
  }
}