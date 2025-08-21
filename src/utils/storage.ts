import { Transaction } from '@/types/transaction';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'gold_transactions';
const MAX_TRANSACTIONS = 10;

export async function saveTransaction(transaction: Transaction): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Save to Supabase
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: transaction.id,
          user_id: user.id,
          type: transaction.type,
          weight: transaction.weight,
          purity: transaction.purity,
          reduction: transaction.reduction,
          rate: transaction.rate,
          fine_gold: transaction.fineGold,
          amount: transaction.amount,
          remaining_fine_gold: transaction.remainingFineGold,
        });
      
      if (error) throw error;
    } else {
      // Fallback to localStorage if not authenticated
      const transactions = await getTransactions();
      transactions.unshift(transaction);
      const limitedTransactions = transactions.slice(0, MAX_TRANSACTIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedTransactions));
    }
  } catch (error) {
    console.error('Failed to save transaction:', error);
    // Fallback to localStorage on error
    const transactions = await getTransactions();
    transactions.unshift(transaction);
    const limitedTransactions = transactions.slice(0, MAX_TRANSACTIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedTransactions));
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get from Supabase
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(t => ({
        id: t.id,
        type: t.type as 'EXCHANGE' | 'PURCHASE' | 'SALE',
        weight: Number(t.weight),
        purity: Number(t.purity),
        reduction: t.reduction ? Number(t.reduction) : undefined,
        rate: Number(t.rate),
        fineGold: Number(t.fine_gold),
        amount: Number(t.amount),
        remainingFineGold: t.remaining_fine_gold ? Number(t.remaining_fine_gold) : undefined,
        date: new Date(t.created_at),
      })) || [];
    } else {
      // Fallback to localStorage if not authenticated
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const transactions = JSON.parse(stored);
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }
  } catch (error) {
    console.error('Failed to load transactions:', error);
    // Fallback to localStorage on error
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }));
  }
}

export async function updateTransaction(updatedTransaction: Transaction): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Update in Supabase
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
        })
        .eq('id', updatedTransaction.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      // Fallback to localStorage if not authenticated
      const transactions = await getTransactions();
      const index = transactions.findIndex(t => t.id === updatedTransaction.id);
      
      if (index !== -1) {
        transactions[index] = updatedTransaction;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      }
    }
  } catch (error) {
    console.error('Failed to update transaction:', error);
    // Fallback to localStorage on error
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === updatedTransaction.id);
    
    if (index !== -1) {
      transactions[index] = updatedTransaction;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }
}

export async function clearTransactions(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Clear from Supabase
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    }
    
    // Also clear localStorage
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear transactions:', error);
    // Fallback to localStorage clear on error
    localStorage.removeItem(STORAGE_KEY);
  }
}
