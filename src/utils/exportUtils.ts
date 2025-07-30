import * as XLSX from 'xlsx';
import { Transaction } from '@/types/transaction';
import { useTranslation } from '@/utils/translations';

export interface ExportSummary {
  totalTransactions: number;
  totalWeight: number;
  totalFineGold: number;
  totalAmount: number;
  totalProfit: number; // Total profit from exchanges
  typeBreakdown: Record<string, number>;
}

export function calculateSummary(transactions: Transaction[]): ExportSummary {
  const totalWeight = transactions.reduce((sum, t) => sum + t.weight, 0);
  const totalFineGold = transactions.reduce((sum, t) => sum + t.fineGold, 0);
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = transactions.reduce((sum, t) => sum + (t.profit || 0), 0);
  
  const typeBreakdown = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTransactions: transactions.length,
    totalWeight: Number(totalWeight.toFixed(3)),
    totalFineGold: Number(totalFineGold.toFixed(3)),
    totalAmount: Number(totalAmount.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(3)),
    typeBreakdown
  };
}

export function formatTransactionType(type: string, language: string): string {
  const translations = {
    en: { exchange: 'EXCHANGE', purchase: 'PURCHASE', sale: 'SALE' },
    hi: { exchange: 'अदला-बदली', purchase: 'खरीदना', sale: 'बेचना' },
    mr: { exchange: 'अदलाबदल', purchase: 'खरेदी', sale: 'विक्री' }
  };
  
  const lang = language as keyof typeof translations;
  const typeKey = type.toLowerCase() as keyof typeof translations.en;
  return translations[lang]?.[typeKey] || type;
}

export function exportTransactionsToExcel(
  transactions: Transaction[],
  summary: ExportSummary,
  filters: { dateFrom: string; dateTo: string; typeFilter: string },
  language: string
): void {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const excelData = transactions.map(transaction => ({
    'ID': transaction.id,
    'Date': transaction.date.toLocaleDateString(),
    'Time': transaction.date.toLocaleTimeString(),
    'Type': formatTransactionType(transaction.type, language),
    'Weight (g)': transaction.weight,
    'Purity (%)': transaction.purity,
    'Reduction (%)': transaction.reduction || 0,
    'Rate (₹/g)': transaction.rate,
    'Fine Gold (g)': transaction.fineGold,
    'Amount (₹)': transaction.amount,
    'Profit (g)': transaction.profit || 0
  }));
  
  // Add summary rows
  const summaryData = [
    {},
    { 'ID': '=== SUMMARY ===' },
    { 'ID': 'Total Transactions', 'Date': summary.totalTransactions },
    { 'ID': 'Total Weight (g)', 'Date': summary.totalWeight },
    { 'ID': 'Total Fine Gold (g)', 'Date': summary.totalFineGold },
    { 'ID': 'Total Amount (₹)', 'Date': summary.totalAmount },
    { 'ID': 'Total Profit (g)', 'Date': summary.totalProfit },
    {},
    { 'ID': '=== TYPE BREAKDOWN ===' }
  ];
  
  Object.entries(summary.typeBreakdown).forEach(([type, count]) => {
    summaryData.push({
      'ID': formatTransactionType(type, language),
      'Date': count
    });
  });
  
  const allData = [...excelData, ...summaryData];
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(allData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  // Generate filename with date range
  const fromStr = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'all';
  const toStr = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'all';
  const typeStr = filters.typeFilter === 'ALL' ? 'all' : filters.typeFilter.toLowerCase();
  const filename = `gold_transactions_${typeStr}_${fromStr}_to_${toStr}.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, filename);
}