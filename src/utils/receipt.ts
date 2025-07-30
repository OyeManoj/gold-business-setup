import { Transaction } from '@/types/transaction';
import { Language } from '@/components/LanguageToggle';
import { translations } from './translations';

export function generateReceiptText(transaction: Transaction, language: Language = 'en'): string {
  const t = translations[language];
  const date = transaction.date.toLocaleDateString();
  const time = transaction.date.toLocaleTimeString();

  let receipt = `---------------------------------\n`;
  receipt += `      GOLD TRANSACTION RECEIPT\n`;
  receipt += `---------------------------------\n`;
  receipt += `${t.date}: ${date}    ${t.time}: ${time}\n\n`;
  receipt += `${t.transaction}: ${t[transaction.type.toLowerCase() as keyof typeof t]}\n\n`;
  receipt += `${t.weight}: ${transaction.weight} ${t.grams}\n`;
  receipt += `${t.purity}: ${transaction.purity} ${t.percent}\n`;
  
  if (transaction.reduction !== undefined) {
    receipt += `${t.reduction}: ${transaction.reduction} ${t.percent}\n`;
  }
  
  receipt += `${t.fineGold}: ${transaction.fineGold} ${t.grams}\n`;
  receipt += `${t.rate}: ${t.rupees}${transaction.rate}/${t.grams}\n`;
  receipt += `${t.amount}: ${t.rupees}${transaction.amount}\n\n`;
  
  if (transaction.cashPaid && transaction.cashPaid > 0) {
    receipt += `${t.cashPaid}: ${t.rupees}${transaction.cashPaid}\n`;
    if (transaction.remainingFineGold) {
      receipt += `${t.remainingFineGold}: ${transaction.remainingFineGold} ${t.grams}\n`;
    }
    receipt += `\n`;
  }
  
  receipt += `${t.thankYou}\n`;
  receipt += `---------------------------------`;

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