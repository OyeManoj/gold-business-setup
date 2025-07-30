import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionType } from "@/types/transaction";
import { ArrowRightLeft, ShoppingCart, DollarSign } from "lucide-react";

interface TransactionSummaryProps {
  type: TransactionType;
  weight: number;
  purity: number;
  rate: number;
  fineGold: number;
  amount: number;
  reduction?: number;
  
  remainingFineGold?: number;
  language: string;
}

export function TransactionSummary({
  type,
  weight,
  purity,
  rate,
  fineGold,
  amount,
  reduction,
  remainingFineGold,
}: TransactionSummaryProps) {
  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return <ArrowRightLeft className="w-6 h-6 text-warning" />;
      case 'PURCHASE': return <ShoppingCart className="w-6 h-6 text-success" />;
      case 'SALE': return <DollarSign className="w-6 h-6 text-primary" />;
      default: return <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getTypeName = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return 'Exchange';
      case 'PURCHASE': return 'Purchase';
      case 'SALE': return 'Sale';
      default: return 'Transaction';
    }
  };

  const adjustedPurity = reduction ? purity - (purity * reduction / 100) : purity;

  return (
    <Card className="w-full max-w-md mx-auto bg-background border border-border shadow-sm">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {getTypeIcon(type)}
          <CardTitle className="text-lg font-medium text-warning">
            {getTypeName(type)} Summary
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Fine Weight Output - Highlighted Section */}
        <div className="bg-warning/10 rounded-lg p-4 text-center">
          <div className="text-warning text-sm font-medium mb-2">
            Fine Weight Output
          </div>
          <div className="text-3xl font-bold text-warning">
            {fineGold}g
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Old Weight:</span>
            <span className="text-foreground font-medium">{weight}g</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Original Purity:</span>
            <span className="text-foreground font-medium">{purity}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Reduction:</span>
            <span className="text-foreground font-medium">{reduction || 0}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Adjusted Purity:</span>
            <span className="text-foreground font-medium">{adjustedPurity.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Fine Weight:</span>
            <Badge variant="secondary" className="bg-foreground text-background font-medium">
              {fineGold}g
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Payment:</span>
            {type === 'EXCHANGE' ? (
              <Badge variant="outline" className="border-warning text-warning font-medium">
                Fine Gold
              </Badge>
            ) : (
              <Badge variant="outline" className="border-success text-success font-medium">
                ₹{amount.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}