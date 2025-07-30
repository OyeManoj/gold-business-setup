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

  // Add styling to the worksheet
  const range = XLSX.utils.decode_range(mainWorksheet['!ref'] || 'A1');
  
  // Style headers (row 1)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!mainWorksheet[cellRef]) continue;
    
    mainWorksheet[cellRef].s = {
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

  // Style data rows with alternating colors and type-based colors
  for (let row = 1; row <= range.e.r; row++) {
    const transactionIndex = row - 1;
    const transaction = transactions[transactionIndex];
    
    if (!transaction) continue;

    // Get type color
    let typeColor = "FFFFFF"; // default white
    if (transaction.type === 'PURCHASE') {
      typeColor = "C6F6D5"; // light green
    } else if (transaction.type === 'SALE') {
      typeColor = "FED7D7"; // light red
    } else if (transaction.type === 'EXCHANGE') {
      typeColor = "BEE3F8"; // light blue
    }

    // Alternating row background
    const isEvenRow = row % 2 === 0;
    const baseColor = isEvenRow ? "F7FAFC" : "FFFFFF";

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!mainWorksheet[cellRef]) continue;

      // Special styling for type column
      if (col === 4) { // Type column
        mainWorksheet[cellRef].s = {
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
        // Regular cell styling
        const alignment = col === 0 || col === 1 || col === 2 || col === 3 ? "center" : "right";
        const isBold = col === 10; // Total Amount column
        
        mainWorksheet[cellRef].s = {
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

        // Special formatting for amount column
        if (col === 10) {
          mainWorksheet[cellRef].s.font = { bold: true, color: { rgb: "1A365D" } };
        }
      }
    }
  }
  
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

  // Add styling to summary worksheet
  const summaryRange = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1');
  
  for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
    for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!summaryWorksheet[cellRef]) continue;

      const cellValue = summaryWorksheet[cellRef].v;
      
      // Style section headers
      if (cellValue === 'TRANSACTION SUMMARY' || cellValue === 'TYPE BREAKDOWN' || cellValue === 'FILTER DETAILS') {
        summaryWorksheet[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, size: 14 },
          fill: { fgColor: { rgb: "4A5568" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "medium", color: { rgb: "000000" } }
          }
        };
      }
      // Style data rows
      else if (cellValue && cellValue !== '') {
        const isTotalRow = typeof cellValue === 'string' && cellValue.includes('Total');
        const isAmountRow = typeof cellValue === 'string' && cellValue.includes('Total Amount');
        
        summaryWorksheet[cellRef].s = {
          font: { 
            bold: isTotalRow,
            color: { rgb: isAmountRow ? "1A365D" : "2D3748" },
            size: isTotalRow ? 12 : 11
          },
          fill: { fgColor: { rgb: isTotalRow ? "F7FAFC" : "FFFFFF" } },
          alignment: { 
            horizontal: col === 0 ? "left" : "center", 
            vertical: "center" 
          },
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