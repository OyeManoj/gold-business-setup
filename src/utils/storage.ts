import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'gold_transactions';
const MAX_TRANSACTIONS = 100;

export async function saveTransaction(transaction: Transaction): Promise<void> {
  // Local-only storage for security - no cloud database exposure
  const transactions = await getTransactions();
  transactions.unshift(transaction);
  const limitedTransactions = transactions.slice(0, MAX_TRANSACTIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedTransactions));
}

export async function getTransactions(): Promise<Transaction[]> {
  // Local-only storage for security
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const transactions = JSON.parse(stored);
  return transactions.map((t: any) => ({
    ...t,
    date: new Date(t.date)
  }));
}

export async function updateTransaction(updatedTransaction: Transaction): Promise<void> {
  // Local-only storage for security
  const transactions = await getTransactions();
  const index = transactions.findIndex(t => t.id === updatedTransaction.id);
  
  if (index !== -1) {
    transactions[index] = updatedTransaction;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
}

export async function clearTransactions(): Promise<void> {
  // Local-only storage for security - removes dangerous mass delete capability
  localStorage.removeItem(STORAGE_KEY);
}