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

  // Optimized for 3x4 inch paper (approximately 32 characters width at 8pt font)
  const formatLine = (label: string, value: string, unit: string = '') => {
    const totalWidth = 32; // Exact fit for 3 inch width
    const valueUnit = value + unit;
    const spaces = totalWidth - label.length - valueUnit.length;
    return `${label}${' '.repeat(Math.max(1, spaces))}${valueUnit}\n`;
  };

  let receipt = `\n`;
  
  // Add business details if provided and enabled
  if (businessProfile && receiptSettings) {
    if (receiptSettings.showBusinessName && businessProfile.name) {
      const businessName = businessProfile.name.toUpperCase();
      receipt += `${businessName}\n`;
    }
    
    if (receiptSettings.showBusinessPhone && businessProfile.phone) {
      const phoneText = `TEL: ${businessProfile.phone}`;
      receipt += `${phoneText}\n`;
    }
    
    if (receiptSettings.showBusinessAddress && businessProfile.address) {
      // Split address into lines for 32-character width
      const maxLineLength = 32;
      const words = businessProfile.address.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + ' ' + word).length <= maxLineLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            receipt += `${currentLine}\n`;
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        receipt += `${currentLine}\n`;
      }
    }
    
    if (receiptSettings.showBusinessName || receiptSettings.showBusinessPhone || receiptSettings.showBusinessAddress) {
      receipt += `────────────────────────────────\n`;
    }
  }
  
  receipt += `GOLD EXCHANGE RECEIPT\n`;
  receipt += `════════════════════════════════\n`;
  receipt += `ID: ${transaction.id}\n`;
  receipt += `${date} • ${time}\n`;
  receipt += `────────────────────────────────\n`;
  receipt += formatLine('GROSS WEIGHT', String(transaction.weight), 'G');
  receipt += formatLine('PURITY', String(transaction.purity), '%');
  
  if (transaction.reduction !== undefined) {
    receipt += formatLine('REDUCTION', String(transaction.reduction), '%');
  }
  
  receipt += `────────────────────────────────\n`;
  receipt += formatLine('FINE WEIGHT', String(transaction.fineGold), 'G');

  // Only show payment for non-Exchange transactions
  if (transaction.type !== 'EXCHANGE') {
    receipt += formatLine('PAYMENT', `${t.rupees}${transaction.amount.toLocaleString()}`);
  }
  
  receipt += `\n────────────────────────────────\n`;
  receipt += `THANK YOU FOR YOUR BUSINESS\n\n`;
  
  return receipt;
}

export async function printReceipt(receiptText: string): Promise<void> {
  console.log('USB Thermal Printer - Connecting...');
  
  try {
    // Check if Web Serial API is supported
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported. Please use Chrome/Edge browser.');
    }

    // Request a port
    const port = await (navigator as any).serial.requestPort();
    
    // Open the port
    await port.open({ 
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: 'none'
    });

    console.log('Connected to USB thermal printer');

    // Create ESC/POS commands
    const writer = port.writable.getWriter();
    
    // ESC/POS Commands
    const ESC = '\x1B';
    const LF = '\x0A';
    const CR = '\x0D';
    
    // Initialize printer
    await writer.write(new TextEncoder().encode(ESC + '@')); // Initialize
    await writer.write(new TextEncoder().encode(ESC + 'a' + '\x01')); // Center align
    
    // Print receipt text
    await writer.write(new TextEncoder().encode(receiptText));
    
    // Feed paper and cut
    await writer.write(new TextEncoder().encode(LF + LF + LF));
    await writer.write(new TextEncoder().encode(ESC + 'i')); // Partial cut
    
    // Release the writer
    writer.releaseLock();
    
    // Close the port
    await port.close();
    
    console.log('Receipt printed successfully');
    
  } catch (error) {
    console.error('USB Thermal Printer Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No port selected')) {
        alert('Please select your USB thermal printer from the device list.');
      } else if (error.message.includes('not supported')) {
        alert('USB thermal printing requires Chrome or Edge browser with Web Serial API support.');
      } else {
        alert(`Thermal printer error: ${error.message}\n\nPlease check:\n1. Printer is connected via USB\n2. Printer is powered on\n3. Browser permissions are granted`);
      }
    } else {
      alert('Unknown thermal printer error. Please check your printer connection.');
    }
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