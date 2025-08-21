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
  const date = transaction.date.toLocaleDateString('en-IN');
  const time = transaction.date.toLocaleTimeString('en-IN', { hour12: true });

  // Helper function for proper alignment for 32-character width
  const formatLine = (label: string, value: string, unit: string = '') => {
    const totalWidth = 32; // 32-character width
    const valueUnit = value + unit;
    const spaces = totalWidth - label.length - valueUnit.length;
    return `${label}${' '.repeat(Math.max(1, spaces))}${valueUnit}\n`;
  };

  // Special formatting for emphasized lines
  const formatLargeLine = (label: string, value: string, unit: string = '') => {
    const totalWidth = 32;
    const valueUnit = value + unit;
    const spaces = totalWidth - label.length - valueUnit.length;
    return `${label}${' '.repeat(Math.max(1, spaces))}${valueUnit}\n`;
  };

  let receipt = ``;
  
  // Center text helper function
  const centerText = (text: string) => {
    const totalWidth = 32; // 3-inch paper width
    const padding = Math.floor((totalWidth - text.length) / 2);
    return ' '.repeat(Math.max(0, padding)) + text;
  };
  
  // Add business details if provided and enabled
  if (businessProfile && receiptSettings) {
    
    if (receiptSettings.showBusinessName && businessProfile.name) {
      const businessName = businessProfile.name.toUpperCase();
      receipt += `${centerText(businessName)}\n`;
    }
    
    if (receiptSettings.showBusinessPhone && businessProfile.phone) {
      const phoneText = `TEL: ${businessProfile.phone}`;
      receipt += `${centerText(phoneText)}\n`;
    }
    
    if (receiptSettings.showBusinessAddress && businessProfile.address) {
      // Split address into lines for 3-inch paper and center each line
      const maxLineLength = 32;
      const words = businessProfile.address.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + ' ' + word).length <= maxLineLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            receipt += `${centerText(currentLine)}\n`;
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        receipt += `${centerText(currentLine)}\n`;
      }
    }
    
    if (receiptSettings.showBusinessName || receiptSettings.showBusinessPhone || receiptSettings.showBusinessAddress) {
      receipt += `================================\n`;
    }
  }
  
  // Display transaction type based on the actual transaction type
  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'EXCHANGE':
        return 'GOLD EXCHANGE';
      case 'PURCHASE':
        return 'GOLD PURCHASE';
      case 'SALE':
        return 'GOLD SALE';
      default:
        return 'GOLD TRANSACTION';
    }
  };
  
  receipt += `${centerText(getTransactionTitle(transaction.type))}\n`;
  receipt += `================================\n`;
  const dateTimeText = `${date} • ${time}`;
  receipt += `${centerText(dateTimeText)}\n`;
  receipt += `--------------------------------\n`;
  receipt += formatLine('WEIGHT', transaction.weight.toFixed(3), 'G');
  receipt += formatLine('PURITY', String(transaction.purity), '%');
  
  if (transaction.reduction !== undefined) {
    receipt += formatLine('REDUCTION', String(transaction.reduction), '%');
  }
  
  receipt += `--------------------------------\n`;
  receipt += formatLargeLine('FINE GOLD', transaction.fineGold.toFixed(3), 'G');

  // Only show payment for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += formatLargeLine('PAYMENT', `${t.rupees}${transaction.amount.toLocaleString()}`);
  }
  
  receipt += `\n================================\n`;
  
  receipt += `${centerText('THANK YOU')}\n`;
  receipt += `${centerText('VISIT AGAIN')}\n`;
  
  return receipt;
}

export function printReceipt(receiptText: string): void {
  // Try multiple approaches for printing
  
  // Method 1: Try window.open with noopener
  try {
    const printWindow = window.open('', '_blank', 'width=400,height=600,noopener');
    
    if (printWindow && printWindow.document) {
      // Prevent access to opener window for security
      printWindow.opener = null;
      
      // Write secure HTML structure
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 10px;
                font-weight: 600;
                margin: 0;
                padding: 0;
                white-space: pre;
                line-height: 1.2;
                background: #ffffff;
                color: #000000;
                letter-spacing: 0.3px;
                text-align: left;
                word-spacing: normal;
              }
              pre {
                margin: 0;
                padding: 0;
                text-align: left;
                white-space: pre-wrap;
                font-weight: 600;
              }
              @media print {
                * {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                body { 
                  margin: 0 !important;
                  padding: 0 !important;
                  font-size: 13px;
                  font-weight: 700;
                  line-height: 1.1;
                  background: white !important;
                  text-align: left !important;
                  vertical-align: top !important;
                  letter-spacing: 0.2px;
                }
                pre {
                  margin: 0 !important;
                  padding: 0 !important;
                  text-align: left !important;
                  font-weight: 700;
                }
                @page {
                  size: 3in 4in;
                  margin: 0 !important;
              }
            </style>
          </head>
          <body><pre id="receipt"></pre></body>
        </html>
      `);
      printWindow.document.close();
      
      // Safely inject receipt text using textContent to prevent XSS
      const receiptElement = printWindow.document.getElementById('receipt');
      
      if (receiptElement) {
        receiptElement.textContent = receiptText;
        
        // Add a small delay to ensure content is loaded before printing
        setTimeout(() => {
          try {
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
          } catch (error) {
            console.error('Print failed:', error);
          }
        }, 100);
      }
      
      return;
    }
  } catch (error) {
    console.error('Method 1 failed:', error);
  }
  
  // Method 2: Fallback - create a hidden iframe for printing
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    if (iframe.contentWindow) {
      iframe.contentWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body {
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 10px;
                font-weight: 600;
                margin: 0;
                padding: 0;
                white-space: pre-wrap;
                line-height: 1.2;
                background: #ffffff;
                color: #000000;
                letter-spacing: 0.3px;
              }
              @media print {
                body { 
                  margin: 0 !important; 
                  padding: 0 !important;
                  font-size: 13px;
                  font-weight: 700;
                  line-height: 1.1;
                  background: white;
                  letter-spacing: 0.2px;
                }
                @page {
                  size: 3in 4in;
                  margin: 0 !important;
              }
            </style>
          </head>
          <body><pre id="iframe-receipt"></pre></body>
        </html>
      `);
      iframe.contentWindow.document.close();
      
      // Security: Use textContent to prevent XSS
      const receiptElement = iframe.contentWindow.document.getElementById('iframe-receipt');
      if (receiptElement) {
        receiptElement.textContent = receiptText;
        
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
          } catch (error) {
            console.error('Iframe print failed:', error);
            document.body.removeChild(iframe);
          }
        }, 100);
      }
      
      return;
    }
  } catch (error) {
    console.error('Method 2 failed:', error);
  }
  
  // Method 3: Last resort - show alert with instructions
  console.error('All print methods failed');
  // Security: Don't include sensitive receipt text in alert
  alert(`Print failed: Popup might be blocked. 

Please:
1. Enable popups for this site in your browser
2. Or use your browser's print function (Ctrl+P) on the main page to print the transaction details manually`);
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