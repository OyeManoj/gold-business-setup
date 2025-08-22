import { ExportSummary } from '@/utils/exportUtils';
import { formatIndianCurrency, formatIndianRate, formatWeight } from '@/utils/indianFormatting';

interface TransactionSummaryCardProps {
  summary: ExportSummary;
}

export function TransactionSummaryCard({ summary }: TransactionSummaryCardProps) {
  return (
    <div className="space-y-3">
      {/* Basic Summary */}
      <div className="p-3 bg-primary/10 rounded-lg">
        <h3 className="font-medium mb-2 text-sm">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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

      {/* Average Prices */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
        <h3 className="font-medium mb-3">Average Prices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Purchase Rates</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Day:</span>
                <span className="font-medium">{formatIndianRate(summary.averagePrices.purchase.day || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week:</span>
                <span className="font-medium">{formatIndianRate(summary.averagePrices.purchase.week || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month:</span>
                <span className="font-medium">{formatIndianRate(summary.averagePrices.purchase.month || 0)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Sale Rates</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Day:</span>
                <span className="font-medium">{formatIndianRate(summary.averagePrices.sale.day || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week:</span>
                <span className="font-medium">{formatIndianRate(summary.averagePrices.sale.week || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month:</span>
                <span className="font-medium">{formatIndianRate(summary.averagePrices.sale.month || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit & Loss and Exchange Profit */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profit & Loss */}
          <div>
            <h3 className="font-medium mb-3">Profit & Loss</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Day PnL:</span>
                <span className={`font-medium ${summary.pnl.day >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatIndianCurrency(summary.pnl.day)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week PnL:</span>
                <span className={`font-medium ${summary.pnl.week >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatIndianCurrency(summary.pnl.week)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month PnL:</span>
                <span className={`font-medium ${summary.pnl.month >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatIndianCurrency(summary.pnl.month)}
                </span>
              </div>
            </div>
          </div>

          {/* Exchange Profit */}
          <div>
            <h3 className="font-medium mb-3">Exchange Profit (in grams)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Day:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatWeight(summary.exchangeProfit.day)}g
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatWeight(summary.exchangeProfit.week)}g
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatWeight(summary.exchangeProfit.month)}g
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}