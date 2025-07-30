import * as XLSX from 'xlsx';
import { Transaction } from '@/types/transaction';
import { useTranslation } from '@/utils/translations';

export interface ExportSummary {
  totalTransactions: number;
  totalWeight: number;
  totalFineGold: number;
  totalAmount: number;
  typeBreakdown: Record<string, number>;
}

export function calculateSummary(transactions: Transaction[]): ExportSummary {
  const totalWeight = transactions.reduce((sum, t) => sum + t.weight, 0);
  const totalFineGold = transactions.reduce((sum, t) => sum + t.fineGold, 0);
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const typeBreakdown = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTransactions: transactions.length,
    totalWeight: Number(totalWeight.toFixed(3)),
    totalFineGold: Number(totalFineGold.toFixed(3)),
    totalAmount: Number(totalAmount.toFixed(2)),
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
  
  // Prepare main transaction data
  const excelData = transactions.map((transaction, index) => ({
    'Sr. No.': index + 1,
    'Transaction ID': transaction.id,
    'Date': transaction.date.toLocaleDateString('en-IN'),
    'Time': transaction.date.toLocaleTimeString('en-IN', { hour12: false }),
    'Type': formatTransactionType(transaction.type, language),
    'Gross Weight (g)': Number(transaction.weight.toFixed(3)),
    'Purity (%)': Number(transaction.purity.toFixed(2)),
    'Reduction (%)': transaction.reduction ? Number(transaction.reduction.toFixed(2)) : 0,
    'Rate (₹/g)': Number(transaction.rate.toFixed(2)),
    'Fine Gold (g)': Number(transaction.fineGold.toFixed(3)),
    'Total Amount (₹)': Number(transaction.amount.toFixed(2))
  }));
  
  // Create main worksheet
  const mainWorksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths for better formatting
  const colWidths = [
    { wch: 8 },   // Sr. No.
    { wch: 15 },  // Transaction ID
    { wch: 12 },  // Date
    { wch: 10 },  // Time
    { wch: 12 },  // Type
    { wch: 16 },  // Gross Weight
    { wch: 12 },  // Purity
    { wch: 14 },  // Reduction
    { wch: 12 },  // Rate
    { wch: 15 },  // Fine Gold
    { wch: 18 }   // Total Amount
  ];
  mainWorksheet['!cols'] = colWidths;
  
  // Add main worksheet
  XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'Transaction Details');
  
  // Create summary worksheet
  const summarySheetData = [
    { 'Description': 'TRANSACTION SUMMARY', 'Value': '', 'Unit': '' },
    { 'Description': '', 'Value': '', 'Unit': '' },
    { 'Description': 'Total Transactions', 'Value': summary.totalTransactions, 'Unit': 'count' },
    { 'Description': 'Total Gross Weight', 'Value': Number(summary.totalWeight.toFixed(3)), 'Unit': 'grams' },
    { 'Description': 'Total Fine Gold', 'Value': Number(summary.totalFineGold.toFixed(3)), 'Unit': 'grams' },
    { 'Description': 'Total Amount', 'Value': Number(summary.totalAmount.toFixed(2)), 'Unit': '₹' },
    { 'Description': '', 'Value': '', 'Unit': '' },
    { 'Description': 'TYPE BREAKDOWN', 'Value': '', 'Unit': '' },
    { 'Description': '', 'Value': '', 'Unit': '' }
  ];
  
  // Add type breakdown to summary
  Object.entries(summary.typeBreakdown).forEach(([type, count]) => {
    summarySheetData.push({
      'Description': formatTransactionType(type, language),
      'Value': count,
      'Unit': 'transactions'
    });
  });
  
  // Add filters information
  summarySheetData.push(
    { 'Description': '', 'Value': '', 'Unit': '' },
    { 'Description': 'FILTER DETAILS', 'Value': '', 'Unit': '' },
    { 'Description': '', 'Value': '', 'Unit': '' },
    { 'Description': 'Date From', 'Value': filters.dateFrom || 'All dates', 'Unit': '' },
    { 'Description': 'Date To', 'Value': filters.dateTo || 'All dates', 'Unit': '' },
    { 'Description': 'Type Filter', 'Value': filters.typeFilter === 'ALL' ? 'All Types' : formatTransactionType(filters.typeFilter, language), 'Unit': '' },
    { 'Description': 'Export Date', 'Value': new Date().toLocaleDateString('en-IN'), 'Unit': '' },
    { 'Description': 'Export Time', 'Value': new Date().toLocaleTimeString('en-IN'), 'Unit': '' }
  );
  
  const summaryWorksheet = XLSX.utils.json_to_sheet(summarySheetData);
  
  // Set column widths for summary sheet
  summaryWorksheet['!cols'] = [
    { wch: 25 },  // Description
    { wch: 20 },  // Value
    { wch: 15 }   // Unit
  ];
  
  // Add summary worksheet
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  
  // Generate formatted filename
  const fromStr = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('en-IN').replace(/\//g, '-') : 'all';
  const toStr = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('en-IN').replace(/\//g, '-') : 'all';
  const typeStr = filters.typeFilter === 'ALL' ? 'all' : filters.typeFilter.toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  const filename = `Gold_Transactions_${typeStr}_${fromStr}_to_${toStr}_${timestamp}.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, filename);
}