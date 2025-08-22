import { ExportSummary } from '@/utils/exportUtils';
import { formatIndianCurrency, formatIndianRate, formatWeight } from '@/utils/indianFormatting';

interface TransactionSummaryCardProps {
  summary: ExportSummary;
}

export function TransactionSummaryCard({ summary }: TransactionSummaryCardProps) {
  return (
    <div className="space-y-2">
      {/* Basic Summary */}
      <div className="p-2 bg-primary/10 rounded-lg">
        <h3 className="font-medium mb-2 text-sm">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Transactions: </span>
            <span className="font-medium">{summary.totalTransactions}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Weight: </span>
            <span className="font-medium">{formatWeight(summary.totalWeight)}g</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Fine Gold: </span>
            <span className="font-medium">{formatWeight(summary.totalFineGold)}g</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Amount: </span>
            <span className="font-medium">{formatIndianCurrency(summary.totalAmount)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Sale Price: </span>
            <span className="font-medium">{formatIndianRate(summary.avgSalePricePerGram)}</span>
          </div>
        </div>
      </div>

      {/* Average Prices, Profit & Loss, and Exchange Profit in one row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Purchase Rates */}
        <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <h4 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Purchase Rates</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Day:</span>
              <span className="font-medium">{formatIndianRate(summary.averagePrices.purchase.day || 0).replace('₹', '').replace('/g', '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Week:</span>
              <span className="font-medium">{formatIndianRate(summary.averagePrices.purchase.week || 0).replace('₹', '').replace('/g', '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month:</span>
              <span className="font-medium">{formatIndianRate(summary.averagePrices.purchase.month || 0).replace('₹', '').replace('/g', '')}</span>
            </div>
          </div>
        </div>

        {/* Sale Rates */}
        <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <h4 className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Sale Rates</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Day:</span>
              <span className="font-medium">{formatIndianRate(summary.averagePrices.sale.day || 0).replace('₹', '').replace('/g', '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Week:</span>
              <span className="font-medium">{formatIndianRate(summary.averagePrices.sale.week || 0).replace('₹', '').replace('/g', '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month:</span>
              <span className="font-medium">{formatIndianRate(summary.averagePrices.sale.month || 0).replace('₹', '').replace('/g', '')}</span>
            </div>
          </div>
        </div>

        {/* Profit & Loss */}
        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
          <h4 className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Profit & Loss</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Day:</span>
              <span className={`font-medium ${summary.pnl.day >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatIndianCurrency(summary.pnl.day).replace('₹', '')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Week:</span>
              <span className={`font-medium ${summary.pnl.week >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatIndianCurrency(summary.pnl.week).replace('₹', '')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month:</span>
              <span className={`font-medium ${summary.pnl.month >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatIndianCurrency(summary.pnl.month).replace('₹', '')}
              </span>
            </div>
          </div>
        </div>

        {/* Exchange Profit */}
        <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
          <h4 className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">Exchange Profit (g)</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Day:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatWeight(summary.exchangeProfit.day)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Week:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatWeight(summary.exchangeProfit.week)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatWeight(summary.exchangeProfit.month)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}