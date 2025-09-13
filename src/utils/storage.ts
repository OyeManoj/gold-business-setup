import { Transaction } from '@/types/transaction';
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from './encryption';

const STORAGE_KEY = 'gold_transactions_offline';

// Get user ID from custom auth
async function getCurrentUserId(): Promise<string | null> {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return currentUser?.user_id || null;
}

// Save to Supabase with offline fallback
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    // Use secure RPC function to bypass RLS
    const { data, error } = await supabase.rpc('upsert_transaction_for_custom_user', {
      input_user_id: userId,
      input_id: transaction.id,
      input_type: transaction.type,
      input_weight: transaction.weight,
      input_purity: transaction.purity,
      input_reduction: transaction.reduction,
      input_rate: transaction.rate,
      input_fine_gold: transaction.fineGold,
      input_amount: transaction.amount,
      input_remaining_fine_gold: transaction.remainingFineGold,
      input_created_at: transaction.date.toISOString(),
      input_updated_at: transaction.date.toISOString()
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Failed to save transaction');
  } catch (error) {
    console.warn('Failed to save to Supabase, saving offline:', error);
    // Fallback to offline storage
    await saveTransactionOffline(transaction);
  }
}

// Get transactions from Supabase with offline fallback
export async function getTransactions(): Promise<Transaction[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    // Use secure RPC function to bypass RLS
    const { data, error } = await supabase.rpc('get_transactions_for_custom_user', {
      input_user_id: userId
    });

    if (error) throw error;

    const supabaseTransactions = data?.map(transformSupabaseToTransaction) || [];
    
    // Merge with offline transactions and sync any pending ones
    const offlineTransactions = await getOfflineTransactions();
    await syncOfflineTransactions();
    
    return supabaseTransactions;
  } catch (error) {
    console.warn('Failed to get from Supabase, using offline:', error);
    return await getOfflineTransactions();
  }
}

// Update transaction in Supabase with offline fallback
export async function updateTransaction(updatedTransaction: Transaction): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    // Use secure RPC function to bypass RLS
    const { data, error } = await supabase.rpc('upsert_transaction_for_custom_user', {
      input_user_id: userId,
      input_id: updatedTransaction.id,
      input_type: updatedTransaction.type,
      input_weight: updatedTransaction.weight,
      input_purity: updatedTransaction.purity,
      input_reduction: updatedTransaction.reduction,
      input_rate: updatedTransaction.rate,
      input_fine_gold: updatedTransaction.fineGold,
      input_amount: updatedTransaction.amount,
      input_remaining_fine_gold: updatedTransaction.remainingFineGold,
      input_created_at: updatedTransaction.date.toISOString(),
      input_updated_at: new Date().toISOString()
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Failed to update transaction');
  } catch (error) {
    console.warn('Failed to update in Supabase, updating offline:', error);
    await updateTransactionOffline(updatedTransaction);
  }
}

// Clear all transactions
export async function clearTransactions(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    // Use secure RPC function to bypass RLS
    const { data, error } = await supabase.rpc('delete_transactions_for_custom_user', {
      input_user_id: userId
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Failed to clear transactions');
  } catch (error) {
    console.warn('Failed to clear from Supabase:', error);
  }

  // Also clear secure offline storage
  if (userId) {
    await SecureStorage.removeSecureItem('transactions_offline', userId);
  }
  localStorage.removeItem(STORAGE_KEY);
}

// Transform Supabase data to Transaction format
function transformSupabaseToTransaction(data: any): Transaction {
  return {
    id: data.id,
    type: data.type,
    weight: Number(data.weight),
    purity: Number(data.purity),
    reduction: data.reduction ? Number(data.reduction) : undefined,
    rate: Number(data.rate),
    fineGold: Number(data.fine_gold),
    amount: Number(data.amount),
    remainingFineGold: data.remaining_fine_gold ? Number(data.remaining_fine_gold) : undefined,
    date: new Date(data.created_at)
  };
}

// Secure offline storage helpers
async function saveTransactionOffline(transaction: Transaction): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const transactions = await getOfflineTransactions();
  transactions.unshift({ ...transaction, _offline: true } as any);
  
  // Use both secure storage and fallback for compatibility
  await SecureStorage.setSecureItem('transactions_offline', transactions, userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

async function getOfflineTransactions(): Promise<Transaction[]> {
  const userId = await getCurrentUserId();
  
  // Try secure storage first
  if (userId) {
    const secureStored = await SecureStorage.getSecureItem<Transaction[]>('transactions_offline', userId);
    if (secureStored) {
      return secureStored.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const transactions = JSON.parse(stored);
  return transactions.map((t: any) => ({
    ...t,
    date: new Date(t.date)
  }));
}

async function updateTransactionOffline(updatedTransaction: Transaction): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const transactions = await getOfflineTransactions();
  const index = transactions.findIndex(t => t.id === updatedTransaction.id);
  
  if (index !== -1) {
    transactions[index] = { ...updatedTransaction, _offline: true } as any;
    
    // Update both secure storage and fallback
    await SecureStorage.setSecureItem('transactions_offline', transactions, userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
}

// Sync offline transactions to Supabase
async function syncOfflineTransactions(): Promise<void> {
  const offlineTransactions = await getOfflineTransactions();
  const pendingTransactions = offlineTransactions.filter((t: any) => t._offline);
  
  if (pendingTransactions.length === 0) return;

  const userId = await getCurrentUserId();
  if (!userId) return;

  for (const transaction of pendingTransactions) {
    try {
      // Use secure RPC function to bypass RLS
      const { data, error } = await supabase.rpc('upsert_transaction_for_custom_user', {
        input_user_id: userId,
        input_id: transaction.id,
        input_type: transaction.type,
        input_weight: transaction.weight,
        input_purity: transaction.purity,
        input_reduction: transaction.reduction,
        input_rate: transaction.rate,
        input_fine_gold: transaction.fineGold,
        input_amount: transaction.amount,
        input_remaining_fine_gold: transaction.remainingFineGold,
        input_created_at: transaction.date.toISOString(),
        input_updated_at: new Date().toISOString()
      });

      if (!error && data?.success) {
        // Remove from offline storage after successful sync
        const allOffline = await getOfflineTransactions();
        const filtered = allOffline.filter(t => t.id !== transaction.id);
        
        // Update both secure storage and fallback
        if (userId) {
          await SecureStorage.setSecureItem('transactions_offline', filtered, userId);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (error) {
      console.warn('Failed to sync transaction:', transaction.id, error);
    }
  }
}