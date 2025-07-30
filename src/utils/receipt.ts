import { Transaction } from '@/types/transaction';
import { Language } from '@/components/LanguageToggle';
import { translations } from './translations';

export function generateReceiptText(transaction: Transaction, language: Language = 'en'): string {
  const t = translations[language];
  const date = transaction.date.toLocaleDateString();
  const time = transaction.date.toLocaleTimeString();

  let receipt = `\n`;
  receipt += `        GOLD EXCHANGE RECEIPT\n`;
  receipt += `        ═══════════════════════\n`;
  receipt += `        ID: ${transaction.id}\n`;
  receipt += `        ${date} • ${time}\n`;
  receipt += `        ───────────────────────\n`;
  receipt += `        GROSS WEIGHT      ${String(transaction.weight).padEnd(8)}G\n`;
  receipt += `        PURITY            ${String(transaction.purity).padEnd(8)}%\n`;
  
  if (transaction.reduction !== undefined) {
    receipt += `        REDUCTION         ${String(transaction.reduction).padEnd(8)}%\n`;
  }
  
  receipt += `        ───────────────────────\n`;
  receipt += `        FINE WEIGHT       ${String(transaction.fineGold).padEnd(8)}G\n`;
  
  // Only show payment for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += `        PAYMENT           ${t.rupees}${transaction.amount.toLocaleString()}\n`;
  }
  
  receipt += `\n        ───────────────────────\n`;
  receipt += `        THANK YOU FOR YOUR BUSINESS\n\n`;
  
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