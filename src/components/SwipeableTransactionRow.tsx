import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Printer, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatTransactionType } from '@/utils/exportUtils';
import { formatIndianCurrency, formatIndianRate, formatWeight, formatPercentage } from '@/utils/indianFormatting';

interface SwipeableTransactionRowProps {
  transaction: Transaction;
  index: number;
  language: string;
  onEdit: (transaction: Transaction) => void;
  onPrint: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function SwipeableTransactionRow({
  transaction,
  index,
  language,
  onEdit,
  onPrint,
  onDelete
}: SwipeableTransactionRowProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX.current;
    
    // Limit swipe distance
    const maxSwipe = 120;
    const clampedDiffX = Math.max(-maxSwipe, Math.min(maxSwipe, diffX));
    setSwipeX(clampedDiffX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Trigger action based on swipe distance
    if (swipeX > 60) {
      onPrint(transaction);
    } else if (swipeX < -60) {
      onEdit(transaction);
    }
    
    // Reset position
    setSwipeX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diffX = currentX - startX.current;
    
    const maxSwipe = 120;
    const clampedDiffX = Math.max(-maxSwipe, Math.min(maxSwipe, diffX));
    setSwipeX(clampedDiffX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (swipeX > 60) {
      onPrint(transaction);
    } else if (swipeX < -60) {
      onEdit(transaction);
    }
    
    setSwipeX(0);
  };

  return (
    <>
      {/* Action Hints */}
      <tr className="absolute inset-0 pointer-events-none">
        <td colSpan={8} className="relative">
          {swipeX > 20 && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-green-600">
              <Printer size={16} />
              <span className="text-sm font-medium">Print</span>
            </div>
          )}
          {swipeX < -20 && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-blue-600">
              <Edit size={16} />
              <span className="text-sm font-medium">Edit</span>
            </div>
          )}
        </td>
      </tr>

      {/* Main Row */}
      <tr
        ref={rowRef}
        className={`border-b border-border hover:bg-muted/5 transition-all duration-200 ${
          index % 2 === 0 ? 'bg-card' : 'bg-muted/5'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-pan-y`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <td className="py-2 px-2">
          <div className="text-sm">
            <div className="font-semibold text-foreground">{transaction.date.toLocaleDateString('en-IN')}</div>
            <div className="text-muted-foreground text-sm font-medium">{transaction.date.toLocaleTimeString('en-IN', { hour12: true })}</div>
          </div>
        </td>
        <td className="py-2 px-2">
          <span className={`inline-flex px-2 py-1 rounded-md text-sm font-bold shadow-sm ${
            transaction.type === 'PURCHASE' 
              ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400' 
              : transaction.type === 'SALE'
              ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {formatTransactionType(transaction.type, language)}
          </span>
        </td>
        <td className="py-2 px-2 text-right font-mono text-sm font-medium">{formatWeight(transaction.weight)}</td>
        <td className="py-2 px-2 text-right font-mono text-sm font-medium">{formatPercentage(transaction.purity)}</td>
        <td className="py-2 px-2 text-right font-mono text-sm font-medium">{formatIndianRate(transaction.rate).replace('₹', '').replace('/g', '')}</td>
        <td className="py-2 px-2 text-right font-mono text-sm font-semibold text-primary">{formatWeight(transaction.fineGold)}</td>
        <td className="py-2 px-2 text-right font-mono text-sm font-bold text-green-700 dark:text-green-400">{formatIndianCurrency(transaction.amount)}</td>
        <td className="py-2 px-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPrint(transaction);
              }}
              className="h-8 w-8 p-0 rounded-md border hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 touch-manipulation"
              title="Print Receipt"
            >
              <Printer size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
              }}
              className="h-8 w-8 p-0 rounded-md border hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 touch-manipulation"
              title="Edit Transaction"
            >
              <Edit size={12} />
            </Button>
          </div>
        </td>
      </tr>
    </>
  );
}