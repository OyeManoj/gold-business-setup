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
  const transactionData = transactions.map((transaction, index) => ({
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

  // Prepare summary data
  const summaryData = [
    { 'Sr. No.': '', 'Transaction ID': '', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '═══ SUMMARY ═══', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Total Transactions:', 'Date': summary.totalTransactions, 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Total Gross Weight:', 'Date': Number(summary.totalWeight.toFixed(3)), 'Time': 'grams', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Total Fine Gold:', 'Date': Number(summary.totalFineGold.toFixed(3)), 'Time': 'grams', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Total Amount:', 'Date': Number(summary.totalAmount.toFixed(2)), 'Time': '₹', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '═══ TYPE BREAKDOWN ═══', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' }
  ];

  // Add type breakdown
  Object.entries(summary.typeBreakdown).forEach(([type, count]) => {
    summaryData.push({
      'Sr. No.': '',
      'Transaction ID': formatTransactionType(type, language) + ':',
      'Date': count,
      'Time': 'transactions',
      'Type': '',
      'Gross Weight (g)': '',
      'Purity (%)': '',
      'Reduction (%)': '',
      'Rate (₹/g)': '',
      'Fine Gold (g)': '',
      'Total Amount (₹)': ''
    });
  });

  // Add filter information
  summaryData.push(
    { 'Sr. No.': '', 'Transaction ID': '', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '═══ FILTERS ═══', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': '', 'Date': '', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Date From:', 'Date': filters.dateFrom || 'All dates', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Date To:', 'Date': filters.dateTo || 'All dates', 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Type Filter:', 'Date': filters.typeFilter === 'ALL' ? 'All Types' : formatTransactionType(filters.typeFilter, language), 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' },
    { 'Sr. No.': '', 'Transaction ID': 'Export Date:', 'Date': new Date().toLocaleDateString('en-IN'), 'Time': '', 'Type': '', 'Gross Weight (g)': '', 'Purity (%)': '', 'Reduction (%)': '', 'Rate (₹/g)': '', 'Fine Gold (g)': '', 'Total Amount (₹)': '' }
  );

  // Combine transaction data and summary
  const allData = [...transactionData, ...summaryData];
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(allData);
  
  // Set column widths
  const colWidths = [
    { wch: 8 },   // Sr. No.
    { wch: 18 },  // Transaction ID
    { wch: 12 },  // Date
    { wch: 12 },  // Time
    { wch: 12 },  // Type
    { wch: 16 },  // Gross Weight
    { wch: 12 },  // Purity
    { wch: 14 },  // Reduction
    { wch: 12 },  // Rate
    { wch: 15 },  // Fine Gold
    { wch: 18 }   // Total Amount
  ];
  worksheet['!cols'] = colWidths;

  // Add styling
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const transactionRows = transactions.length;
  
  // Style headers (row 1)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellRef]) continue;
    
    worksheet[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2D3748" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
  }

  // Style transaction rows
  for (let row = 1; row <= transactionRows; row++) {
    const transactionIndex = row - 1;
    const transaction = transactions[transactionIndex];
    
    if (!transaction) continue;

    // Get type color
    let typeColor = "FFFFFF";
    if (transaction.type === 'PURCHASE') {
      typeColor = "C6F6D5"; // light green
    } else if (transaction.type === 'SALE') {
      typeColor = "FED7D7"; // light red
    } else if (transaction.type === 'EXCHANGE') {
      typeColor = "BEE3F8"; // light blue
    }

    const isEvenRow = row % 2 === 0;
    const baseColor = isEvenRow ? "F7FAFC" : "FFFFFF";

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellRef]) continue;

      if (col === 4) { // Type column
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: typeColor } },
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };
      } else {
        const alignment = col === 0 || col === 1 || col === 2 || col === 3 ? "center" : "right";
        const isBold = col === 10; // Total Amount column
        
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: baseColor } },
          font: { bold: isBold },
          alignment: { horizontal: alignment, vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };

        if (col === 10) {
          worksheet[cellRef].s.font = { bold: true, color: { rgb: "1A365D" } };
        }
      }
    }
  }

  // Style summary section headers
  for (let row = transactionRows + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellRef]) continue;

      const cellValue = worksheet[cellRef].v;
      
      // Style section headers
      if (typeof cellValue === 'string' && (cellValue.includes('═══') || cellValue.includes('Total') || cellValue.includes(':'))) {
        const isHeader = cellValue.includes('═══');
        
        worksheet[cellRef].s = {
          font: { 
            bold: true, 
            color: { rgb: isHeader ? "FFFFFF" : "2D3748" },
            size: isHeader ? 12 : 11
          },
          fill: { fgColor: { rgb: isHeader ? "4A5568" : "F7FAFC" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };
      }
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gold Transactions');
  
  // Generate filename
  const fromStr = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('en-IN').replace(/\//g, '-') : 'all';
  const toStr = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('en-IN').replace(/\//g, '-') : 'all';
  const typeStr = filters.typeFilter === 'ALL' ? 'all' : filters.typeFilter.toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  const filename = `Gold_Transactions_${typeStr}_${fromStr}_to_${toStr}_${timestamp}.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, filename);
}