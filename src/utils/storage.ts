import { Transaction } from '@/types/transaction';
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from './encryption';

const STORAGE_KEY = 'gold_transactions_offline';

// Get user ID from Supabase auth
async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

// Save to Supabase with offline fallback
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    // Try to save to Supabase first
    const { error } = await supabase
      .from('transactions')
      .insert({
        id: transaction.id,
        owner_id: userId,
        type: transaction.type,
        weight: transaction.weight,
        purity: transaction.purity,
        reduction: transaction.reduction,
        rate: transaction.rate,
        fine_gold: transaction.fineGold,
        amount: transaction.amount,
        remaining_fine_gold: transaction.remainingFineGold,
        created_at: transaction.date.toISOString(),
        updated_at: transaction.date.toISOString()
      });

    if (error) throw error;
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
    // Try to get from Supabase
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

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
    const { error } = await supabase
      .from('transactions')
      .update({
        type: updatedTransaction.type,
        weight: updatedTransaction.weight,
        purity: updatedTransaction.purity,
        reduction: updatedTransaction.reduction,
        rate: updatedTransaction.rate,
        fine_gold: updatedTransaction.fineGold,
        amount: updatedTransaction.amount,
        remaining_fine_gold: updatedTransaction.remainingFineGold,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedTransaction.id)
      .eq('owner_id', userId);

    if (error) throw error;
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
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('owner_id', userId);

    if (error) throw error;
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
      const { error } = await supabase
        .from('transactions')
        .upsert({
          id: transaction.id,
          owner_id: userId,
          type: transaction.type,
          weight: transaction.weight,
          purity: transaction.purity,
          reduction: transaction.reduction,
          rate: transaction.rate,
          fine_gold: transaction.fineGold,
          amount: transaction.amount,
          remaining_fine_gold: transaction.remainingFineGold,
          created_at: transaction.date.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
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