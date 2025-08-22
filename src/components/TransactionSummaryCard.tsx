import { ExportSummary } from '@/utils/exportUtils';
import { formatIndianCurrency, formatIndianRate, formatWeight } from '@/utils/indianFormatting';

interface TransactionSummaryCardProps {
  summary: ExportSummary;
}

export function TransactionSummaryCard({ summary }: TransactionSummaryCardProps) {
  return (
    <div className="space-y-2">
      {/* Mobile-first Basic Summary */}
      <div className="p-3 sm:p-4 bg-primary/10 rounded-lg">
        <h3 className="font-medium mb-3 text-sm sm:text-base">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Transactions:</span>
            <span className="font-medium">{summary.totalTransactions}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Total Weight:</span>
            <span className="font-medium">{formatWeight(summary.totalWeight)}g</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Total Fine Gold:</span>
            <span className="font-medium">{formatWeight(summary.totalFineGold)}g</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">{formatIndianCurrency(summary.totalAmount)}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Avg Sale Price:</span>
            <span className="font-medium">{formatIndianRate(summary.avgSalePricePerGram)}</span>
          </div>
        </div>
      </div>

      {/* Mobile-first Grid - Stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Purchase Rates */}
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 sm:mb-3">Purchase Rates</h4>
          <div className="space-y-2 text-xs sm:text-sm">
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
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 sm:mb-3">Sale Rates</h4>
          <div className="space-y-2 text-xs sm:text-sm">
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
        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
          <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2 sm:mb-3">Profit & Loss</h4>
          <div className="space-y-2 text-xs sm:text-sm">
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
        <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
          <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2 sm:mb-3">Exchange Profit (g)</h4>
          <div className="space-y-2 text-xs sm:text-sm">
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