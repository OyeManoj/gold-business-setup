import { Transaction } from '@/types/transaction';
import { Language } from '@/components/LanguageToggle';
import { translations } from './translations';

export function generateReceiptText(transaction: Transaction, language: Language = 'en'): string {
  const t = translations[language];
  const date = transaction.date.toLocaleDateString();
  const time = transaction.date.toLocaleTimeString();

  let receipt = `\n`;
  receipt += `        TRANSACTION RECEIPT\n`;
  receipt += `    ============================\n\n`;
  receipt += `    ID: ${transaction.id}\n`;
  receipt += `    Date: ${date}\n`;
  receipt += `    Time: ${time}\n`;
  receipt += `    Type: ${t[transaction.type.toLowerCase() as keyof typeof t]}\n\n`;
  receipt += `    ----------------------------\n`;
  receipt += `    TRANSACTION DETAILS\n`;
  receipt += `    ----------------------------\n\n`;
  
  receipt += `    Weight:      ${String(transaction.weight).padEnd(12)} ${t.grams}\n`;
  receipt += `    Purity:      ${String(transaction.purity).padEnd(12)} ${t.percent}\n`;
  
  if (transaction.reduction !== undefined) {
    receipt += `    Reduction:   ${String(transaction.reduction).padEnd(12)} ${t.percent}\n`;
  }
  
  receipt += `\n    ┌────────────────────────────┐\n`;
  receipt += `    │      FINE GOLD RESULT      │\n`;
  receipt += `    │                            │\n`;
  receipt += `    │    ${String(transaction.fineGold).padEnd(18)} ${t.grams}  │\n`;
  receipt += `    │                            │\n`;
  receipt += `    └────────────────────────────┘\n\n`;
  
  // Only show rate and amount for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += `    Rate:        ${t.rupees}${String(transaction.rate).padEnd(8)} /${t.grams}\n\n`;
    receipt += `    ============================\n`;
    receipt += `    TOTAL:       ${t.rupees}${transaction.amount.toLocaleString()}\n`;
    receipt += `    ============================\n\n`;
  }
  
  receipt += `    Thank you for your business!\n\n`;
  
  return receipt;
}

export function printReceipt(receiptText: string): void {
  // For web implementation, we'll open a print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              margin: 0;
              padding: 20px;
              white-space: pre-wrap;
              line-height: 1.4;
              max-width: 400px;
              margin: 0 auto;
              background: white;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
                font-size: 12px;
              }
            }
          </style>
        </head>
        <body>${receiptText}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

// For future Bluetooth thermal printer integration
export function sendToThermalPrinter(receiptText: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // This would be implemented with Bluetooth Serial API
    // For now, fall back to regular printing
    printReceipt(receiptText);
    resolve();
  });
}