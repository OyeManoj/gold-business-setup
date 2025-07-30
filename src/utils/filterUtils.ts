import { Transaction } from '@/types/transaction';

export interface TransactionFilters {
  dateFrom: string;
  dateTo: string;
  typeFilter: string;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  return transactions.filter(transaction => {
    // Type filter
    if (filters.typeFilter !== 'ALL' && transaction.type !== filters.typeFilter) {
      return false;
    }
    
    // Date filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (transaction.date < fromDate) {
        return false;
      }
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (transaction.date > toDate) {
        return false;
      }
    }
    
    return true;
  });
}