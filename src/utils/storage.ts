import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'gold_transactions';
const MAX_TRANSACTIONS = 10;

export function saveTransaction(transaction: Transaction): void {
  try {
    const transactions = getTransactions();
    transactions.unshift(transaction);
    
    // Keep only the last 10 transactions
    const limitedTransactions = transactions.slice(0, MAX_TRANSACTIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedTransactions));
  } catch (error) {
    console.error('Failed to save transaction:', error);
  }
}

export function getTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }));
  } catch (error) {
    console.error('Failed to load transactions:', error);
    return [];
  }
}

export function clearTransactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear transactions:', error);
  }
}
