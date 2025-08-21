import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getTransactions } from '@/utils/storage';
import { TransactionType } from '@/types/transaction';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatIndianRate } from '@/utils/indianFormatting';

interface DayAveragePricesProps {
  transactionType: TransactionType;
}

export function DayAveragePrices({ transactionType }: DayAveragePricesProps) {
  const [avgPurchasePrice, setAvgPurchasePrice] = useState<number>(0);
  const [avgSalePrice, setAvgSalePrice] = useState<number>(0);

  useEffect(() => {
    const calculateAverages = async () => {
      const transactions = await getTransactions();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === today.getTime();
      });

      // Calculate average purchase price
      const purchaseTransactions = todayTransactions.filter(t => t.type === 'PURCHASE');
      const avgPurchase = purchaseTransactions.length > 0 
        ? purchaseTransactions.reduce((sum, t) => sum + t.rate, 0) / purchaseTransactions.length
        : 0;

      // Calculate average sale price  
      const saleTransactions = todayTransactions.filter(t => t.type === 'SALE');
      const avgSale = saleTransactions.length > 0
        ? saleTransactions.reduce((sum, t) => sum + t.rate, 0) / saleTransactions.length
        : 0;

      setAvgPurchasePrice(Number(avgPurchase.toFixed(2)));
      setAvgSalePrice(Number(avgSale.toFixed(2)));
    };

    calculateAverages();
  }, []);

  // Only show for PURCHASE and SALE transactions
  if (transactionType === 'EXCHANGE') {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm bg-primary/5 mb-3">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-50 dark:bg-green-950/30">
              <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Today's Avg Purchase</div>
              <div className="text-xs font-semibold text-foreground">
                {avgPurchasePrice > 0 ? formatIndianRate(avgPurchasePrice) : 'No data'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-950/30">
              <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Today's Avg Sale</div>
              <div className="text-xs font-semibold text-foreground">
                {avgSalePrice > 0 ? formatIndianRate(avgSalePrice) : 'No data'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}