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
  console.log('printReceipt called with text:', receiptText);
  
  // Try multiple approaches for printing
  
  // Method 1: Try window.open with noopener
  try {
    const printWindow = window.open('', '_blank', 'width=400,height=600,noopener');
    console.log('Print window opened:', printWindow);
    
    if (printWindow) {
      // Prevent access to opener window for security
      printWindow.opener = null;
      
      // Write secure HTML structure
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
          <body><pre id="receipt"></pre></body>
        </html>
      `);
      printWindow.document.close();
      
      // Safely inject receipt text using textContent to prevent XSS
      const receiptElement = printWindow.document.getElementById('receipt');
      console.log('Receipt element found:', receiptElement);
      
      if (receiptElement) {
        receiptElement.textContent = receiptText;
        console.log('Receipt text set successfully');
      } else {
        console.error('Receipt element not found');
      }
      
      // Add a small delay to ensure content is loaded before printing
      setTimeout(() => {
        console.log('Attempting to print...');
        try {
          printWindow.print();
          console.log('Print dialog should have opened');
          
          // Close the window after a delay
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        } catch (error) {
          console.error('Error calling print():', error);
        }
      }, 100);
      
      return; // Success, exit function
    }
  } catch (error) {
    console.error('Method 1 failed:', error);
  }
  
  // Method 2: Fallback - create a hidden iframe for printing
  try {
    console.log('Trying iframe fallback method...');
    
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
          <body><pre>${receiptText}</pre></body>
        </html>
      `);
      iframe.contentWindow.document.close();
      
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          console.log('Iframe print called');
          
          // Clean up after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        } catch (error) {
          console.error('Iframe print failed:', error);
          document.body.removeChild(iframe);
        }
      }, 100);
      
      return; // Success, exit function
    }
  } catch (error) {
    console.error('Method 2 failed:', error);
  }
  
  // Method 3: Last resort - show alert with instructions
  console.error('All print methods failed');
  alert(`Print failed: Popup might be blocked. 

Please:
1. Enable popups for this site in your browser
2. Or copy the receipt text below and print manually:

${receiptText}`);
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