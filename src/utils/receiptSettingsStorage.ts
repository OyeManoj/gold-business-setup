import { supabase } from '@/integrations/supabase/client';
import { ReceiptSettings } from '@/types/receiptSettings';

const STORAGE_KEY = 'receiptSettings';

const defaultSettings: ReceiptSettings = {
  showBusinessName: true,
  showBusinessPhone: false,
  showBusinessAddress: false,
};

export async function getReceiptSettings(): Promise<ReceiptSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return from localStorage if not authenticated
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    }

    // Try to get from Supabase storage (future implementation)
    // For now, use localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  } catch (error) {
    console.error('Error loading receipt settings:', error);
    return defaultSettings;
  }
}

export async function saveReceiptSettings(settings: ReceiptSettings): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    if (user) {
      // Future: Save to Supabase storage
      // This could be implemented with a receipt_settings table
    }
  } catch (error) {
    console.error('Error saving receipt settings:', error);
  }
}