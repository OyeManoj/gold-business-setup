import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { filterTransactions, TransactionFilters } from '@/utils/filterUtils';
import { calculateSummary } from '@/utils/exportUtils';

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: '',
    dateTo: '',
    typeFilter: 'ALL'
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters);
  }, [transactions, filters]);

  const summary = useMemo(() => {
    return calculateSummary(filteredTransactions);
  }, [filteredTransactions]);

  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    filteredTransactions,
    summary,
    showFilters,
    setShowFilters,
    updateFilter
  };
}