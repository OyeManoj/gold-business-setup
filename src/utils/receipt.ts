import { Transaction } from '@/types/transaction';
import { Language } from '@/components/LanguageToggle';
import { translations } from './translations';

export function generateReceiptText(transaction: Transaction, language: Language = 'en'): string {
  const t = translations[language];
  const date = transaction.date.toLocaleDateString();
  const time = transaction.date.toLocaleTimeString();

  let receipt = `ID: ${transaction.id}\n`;
  receipt += `${date} ${time}\n`;
  receipt += `Type: ${t[transaction.type.toLowerCase() as keyof typeof t]}\n`;
  receipt += `--------------------------------\n`;
  
  receipt += `Weight:      ${transaction.weight} ${t.grams}\n`;
  receipt += `Purity:      ${transaction.purity}${t.percent}\n`;
  
  if (transaction.reduction !== undefined) {
    receipt += `Reduction:   ${transaction.reduction}${t.percent}\n`;
  }
  
  receipt += `Fine Gold:   ${transaction.fineGold} ${t.grams}\n`;
  
  // Only show rate and amount for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += `Rate:        ${t.rupees}${transaction.rate}/${t.grams}\n`;
    receipt += `................................\n`;
    receipt += `TOTAL:       ${t.rupees}${transaction.amount.toLocaleString()}\n`;
    receipt += `................................\n`;
  }
  
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
              font-size: 12px;
              margin: 0;
              padding: 20px;
              white-space: pre-wrap;
            }
            @media print {
              body { margin: 0; padding: 10px; }
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