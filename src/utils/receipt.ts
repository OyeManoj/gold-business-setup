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
    
    if (receiptSettings.showBusinessName || receiptSettings.showBusinessAddress) {
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
  receipt += formatLine('WEIGHT', transaction.weight.toFixed(2), 'G');
  receipt += formatLine('PURITY', transaction.purity.toFixed(2), '%');
  
  if (transaction.reduction !== undefined) {
    receipt += formatLine('REDUCTION', transaction.reduction.toFixed(2), '%');
  }
  
  receipt += `--------------------------------\n`;
  receipt += formatLargeLine('FINE GOLD', transaction.fineGold.toFixed(2), 'G');

  // Only show payment for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += formatLargeLine('PAYMENT', `${t.rupees}${transaction.amount.toFixed(2)}`);
  }
  
  receipt += `\n================================\n`;
  
  receipt += `${centerText('THANK YOU')}\n`;
  receipt += `${centerText('VISIT AGAIN')}\n`;
  
  return receipt;
}

export function printReceipt(receiptText: string): void {
  console.log('Starting print process...');
  
  // Method 1: Modern approach - use the current window if popups are blocked
  try {
    // Create a dedicated print container in the current document
    const printContainer = document.createElement('div');
    printContainer.id = 'receipt-print-container';
    printContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 3in;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      white-space: pre-wrap;
      line-height: 1.2;
      background: white;
      color: black;
      letter-spacing: 0.3px;
      z-index: 9999;
    `;
    
    const receiptPre = document.createElement('pre');
    receiptPre.textContent = receiptText;
    receiptPre.style.cssText = `
      margin: 0;
      padding: 0;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      white-space: pre-wrap;
    `;
    
    printContainer.appendChild(receiptPre);
    document.body.appendChild(printContainer);
    
    // Create print-specific styles
    const printStyles = document.createElement('style');
    printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #receipt-print-container,
        #receipt-print-container * {
          visibility: visible;
        }
        #receipt-print-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 2.8in !important;
          height: auto !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          line-height: 1.1 !important;
          margin: 0.1in !important;
          padding: 0 !important;
          page-break-inside: avoid !important;
        }
        @page {
          size: 3in auto;
          margin: 0.2in 0.1in;
          padding: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    console.log('Print container created, attempting to print...');
    
    // Trigger print
    window.print();
    
    // Cleanup after a delay
    setTimeout(() => {
      try {
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        if (document.head.contains(printStyles)) {
          document.head.removeChild(printStyles);
        }
        console.log('Print cleanup completed');
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }, 1000);
    
    console.log('Print method 1 completed successfully');
    return;
    
  } catch (error) {
    console.error('Method 1 (current window print) failed:', error);
  }
  
  // Method 2: Try popup window as fallback
  try {
    console.log('Attempting popup window method...');
    const printWindow = window.open('', '_blank', 'width=400,height=600,noopener');
    
    if (printWindow && printWindow.document) {
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
                  size: 3in auto;
                  margin: 0.2in 0.1in !important;
                  padding: 0 !important;
              }
            </style>
          </head>
          <body><pre id="receipt"></pre></body>
        </html>
      `);
      printWindow.document.close();
      
      const receiptElement = printWindow.document.getElementById('receipt');
      
      if (receiptElement) {
        receiptElement.textContent = receiptText;
        
        setTimeout(() => {
          try {
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
            console.log('Popup print completed successfully');
          } catch (error) {
            console.error('Popup print failed:', error);
          }
        }, 100);
      }
      
      return;
    } else {
      console.log('Popup window blocked or failed to open');
    }
  } catch (error) {
    console.error('Method 2 (popup window) failed:', error);
  }
  
  // Method 3: Last resort - show receipt in a modal for manual printing
  try {
    console.log('Using fallback method - creating print modal...');
    
    // Remove any existing modal
    const existingModal = document.getElementById('receipt-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'receipt-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
    `;
    
    const receiptDisplay = document.createElement('pre');
    receiptDisplay.textContent = receiptText;
    receiptDisplay.style.cssText = `
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      white-space: pre-wrap;
      line-height: 1.2;
      margin: 0 0 20px 0;
      padding: 0;
    `;
    
    const printButton = document.createElement('button');
    printButton.textContent = 'Print This Receipt';
    printButton.style.cssText = `
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
    `;
    
    const instructionText = document.createElement('p');
    instructionText.innerHTML = `
      <strong>Printing Instructions:</strong><br>
      1. Click "Print This Receipt" button above<br>
      2. Or use Ctrl+P (Cmd+P on Mac) to print<br>
      3. Make sure to select "More Settings" and choose appropriate paper size
    `;
    instructionText.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-top: 15px;
      line-height: 1.4;
    `;
    
    // Event listeners
    closeButton.onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    printButton.onclick = () => {
      window.print();
    };
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(receiptDisplay);
    modalContent.appendChild(printButton);
    modalContent.appendChild(instructionText);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    console.log('Print modal created successfully');
    
  } catch (error) {
    console.error('All print methods failed:', error);
    alert(`Print functionality unavailable. Please copy the receipt details manually.`);
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