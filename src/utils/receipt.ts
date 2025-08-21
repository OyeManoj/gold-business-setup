import { Transaction } from '@/types/transaction';
import { Language } from '@/components/LanguageToggle';
import { BusinessProfile } from '@/types/business';
import { ReceiptSettings } from '@/types/receiptSettings';
import { translations } from './translations';

export function generateReceiptText(
  transaction: Transaction, 
  language: Language = 'en',
  businessProfile?: BusinessProfile,
  receiptSettings?: ReceiptSettings
): string {
  const t = translations[language];
  const date = transaction.date.toLocaleDateString();
  const time = transaction.date.toLocaleTimeString();

  // Helper function for proper alignment
  const formatLine = (label: string, value: string, unit: string = '') => {
    const totalWidth = 19; // Reduced to fit container better
    const valueUnit = value + unit;
    const spaces = totalWidth - label.length - valueUnit.length;
    return `        ${label}${' '.repeat(Math.max(1, spaces))}${valueUnit}\n`;
  };

  let receipt = `\n`;
  
  // Add business details if provided and enabled
  if (businessProfile && receiptSettings) {
    if (receiptSettings.showBusinessName && businessProfile.name) {
      const businessName = businessProfile.name.toUpperCase();
      const padding = Math.max(0, Math.floor((23 - businessName.length) / 2));
      receipt += `        ${' '.repeat(padding)}${businessName}\n`;
    }
    
    if (receiptSettings.showBusinessPhone && businessProfile.phone) {
      const phoneText = `TEL: ${businessProfile.phone}`;
      const padding = Math.max(0, Math.floor((23 - phoneText.length) / 2));
      receipt += `        ${' '.repeat(padding)}${phoneText}\n`;
    }
    
    if (receiptSettings.showBusinessAddress && businessProfile.address) {
      // Split address into lines if too long
      const maxLineLength = 23;
      const words = businessProfile.address.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + ' ' + word).length <= maxLineLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            const padding = Math.max(0, Math.floor((23 - currentLine.length) / 2));
            receipt += `        ${' '.repeat(padding)}${currentLine}\n`;
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        const padding = Math.max(0, Math.floor((23 - currentLine.length) / 2));
        receipt += `        ${' '.repeat(padding)}${currentLine}\n`;
      }
    }
    
    if (receiptSettings.showBusinessName || receiptSettings.showBusinessPhone || receiptSettings.showBusinessAddress) {
      receipt += `        ───────────────────────\n`;
    }
  }
  
  receipt += `        GOLD EXCHANGE RECEIPT\n`;
  receipt += `        ═══════════════════════\n`;
  receipt += `        ID: ${transaction.id}\n`;
  receipt += `        ${date} • ${time}\n`;
  receipt += `        ───────────────────────\n`;
  receipt += formatLine('GROSS WEIGHT', String(transaction.weight), 'G');
  receipt += formatLine('PURITY', String(transaction.purity), '%');
  
  if (transaction.reduction !== undefined) {
    receipt += formatLine('REDUCTION', String(transaction.reduction), '%');
  }
  
  receipt += `        ───────────────────────\n`;
  receipt += formatLine('FINE WEIGHT', String(transaction.fineGold), 'G');

  // Only show payment for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += formatLine('PAYMENT', `${t.rupees}${transaction.amount.toLocaleString()}`);
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
              font-size: 9px;
              font-weight: 300;
              margin: 0;
              padding: 2px;
              white-space: pre-wrap;
              line-height: 1.1;
              width: 3in;
              height: 3in;
              background: #ffffff;
              color: #000000;
              letter-spacing: 0.2px;
              overflow: hidden;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 2px;
                font-size: 8px;
                line-height: 1.0;
                background: white;
                width: 3in;
                height: 3in;
              }
              @page {
                size: 3in 3in;
                margin: 0;
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