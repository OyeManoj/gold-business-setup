import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransactionType } from '@/types/transaction';
import { formatWeight, formatPercentage, formatIndianCurrency, formatIndianRate } from '@/utils/indianFormatting';

interface FormData {
  weight: string;
  purity: string;
  reduction: string;
  rate: string;
}

interface Calculation {
  fineGold: number;
  amount: number;
}

interface LiveCalculationProps {
  transactionType: TransactionType;
  formData: FormData;
  calculation: Calculation;
}

export const LiveCalculation = ({
  transactionType,
  formData,
  calculation
}: LiveCalculationProps) => {
  const getTitle = () => {
    switch (transactionType) {
      case 'EXCHANGE': return 'Exchange Summary';
      case 'PURCHASE': return 'Purchase Summary';
      case 'SALE': return 'Sale Summary';
      default: return 'Summary';
    }
  };

  const getMainValue = () => {
    if (transactionType === 'SALE') {
      return formatIndianCurrency(calculation.amount);
    }
    return formatWeight(calculation.fineGold);
  };

  const getMainLabel = () => {
    switch (transactionType) {
      case 'EXCHANGE': return 'Fine Weight Output';
      case 'PURCHASE': return 'Fine Gold Purchased';
      case 'SALE': return 'Total Amount';
      default: return 'Result';
    }
  };

  return (
    <Card className="h-fit border border-border bg-card rounded-lg">
      <CardHeader className="pb-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-muted text-foreground px-2 py-1 text-xs font-medium rounded-md">
            CALC
          </Badge>
          <CardTitle className="text-base font-semibold text-foreground">
            {getTitle()}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        {/* Main Result */}
        <div className="bg-muted border border-border rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {getMainLabel()}
          </div>
          <div className="text-2xl font-bold text-foreground">
            {getMainValue()}
          </div>
          {transactionType !== 'SALE' && (
            <div className="text-xs text-muted-foreground mt-1">grams</div>
          )}
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-muted-foreground">
              {transactionType === 'EXCHANGE' ? 'Old Weight:' : 'Weight:'}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {formatWeight(parseFloat(formData.weight || '0'))}g
            </span>
          </div>

          {transactionType !== 'SALE' && (
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-medium text-muted-foreground">
                {transactionType === 'EXCHANGE' ? 'Original Purity:' : 'Purity:'}
              </span>
              <span className="text-xs font-semibold text-foreground">
                {formatPercentage(parseFloat(formData.purity || '0'))}%
              </span>
            </div>
          )}

          {transactionType === 'EXCHANGE' && (
            <>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-muted-foreground">Reduction:</span>
                <span className="text-xs font-semibold text-foreground">
                  {formatPercentage(parseFloat(formData.reduction || '0'))}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-muted-foreground">Adjusted Purity:</span>
                <span className="text-xs font-semibold text-foreground">
                  {formatPercentage(parseFloat(formData.purity || '0') - parseFloat(formData.reduction || '0'))}%
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-muted-foreground">Fine Weight:</span>
            <span className="text-xs font-semibold text-foreground">
              <Badge className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded-md">
                {formatWeight(calculation.fineGold)}g
              </Badge>
            </span>
          </div>

          {transactionType !== 'EXCHANGE' && (
            <>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-muted-foreground">Rate:</span>
                <span className="text-xs font-semibold text-foreground">
                  {formatIndianRate(parseFloat(formData.rate || '0'))}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-muted-foreground">Total Amount:</span>
                <span className="text-xs font-semibold text-foreground">
                  {formatIndianCurrency(calculation.amount)}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};