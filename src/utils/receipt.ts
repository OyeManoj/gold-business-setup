import { Transaction } from '@/types/transaction';
import { Language } from '@/components/LanguageToggle';
import { translations } from './translations';

export function generateReceiptText(transaction: Transaction, language: Language = 'en'): string {
  const t = translations[language];
  const date = transaction.date.toLocaleDateString();
  const time = transaction.date.toLocaleTimeString();

  let receipt = `\n\n`;
  receipt += `                RECEIPT\n`;
  receipt += `        ──────────────────────\n\n`;
  receipt += `        ${date}  •  ${time}\n`;
  receipt += `        ${t[transaction.type.toLowerCase() as keyof typeof t].toUpperCase()}\n\n\n`;
  
  receipt += `        Weight        ${transaction.weight} ${t.grams}\n`;
  receipt += `        Purity        ${transaction.purity}${t.percent}\n`;
  
  if (transaction.reduction !== undefined) {
    receipt += `        Reduction     ${transaction.reduction}${t.percent}\n`;
  }
  
  receipt += `\n\n`;
  receipt += `        ┌─────────────────────┐\n`;
  receipt += `        │                     │\n`;
  receipt += `        │   ${String(transaction.fineGold).padEnd(15)} ${t.grams}   │\n`;
  receipt += `        │                     │\n`;
  receipt += `        │    FINE GOLD        │\n`;
  receipt += `        │                     │\n`;
  receipt += `        └─────────────────────┘\n\n`;
  
  // Only show rate and amount for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += `        Rate          ${t.rupees}${transaction.rate}/${t.grams}\n\n`;
    receipt += `        ━━━━━━━━━━━━━━━━━━━━━━\n`;
    receipt += `        TOTAL         ${t.rupees}${transaction.amount.toLocaleString()}\n`;
    receipt += `        ━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  }
  
  receipt += `\n        Thank you\n\n\n`;
  
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
              font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
              font-size: 14px;
              font-weight: 300;
              margin: 0;
              padding: 40px 20px;
              white-space: pre-wrap;
              line-height: 1.6;
              max-width: 350px;
              margin: 0 auto;
              background: #ffffff;
              color: #2c2c2c;
              letter-spacing: 0.5px;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 20px;
                font-size: 12px;
                background: white;
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