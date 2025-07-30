import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionType } from "@/types/transaction";
import { ArrowUpDown, ShoppingCart, TrendingUp } from "lucide-react";

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
      case 'EXCHANGE': return ArrowUpDown;
      case 'PURCHASE': return ShoppingCart;
      case 'SALE': return TrendingUp;
      default: return ArrowUpDown;
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return 'Exchange Summary';
      case 'PURCHASE': return 'Purchase Summary';
      case 'SALE': return 'Sale Summary';
      default: return 'Transaction Summary';
    }
  };

  const TypeIcon = getTypeIcon(type);
  const adjustedPurity = type === 'EXCHANGE' ? purity - (reduction || 0) : purity;

  return (
    <Card className="bg-background border-2 border-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-medium text-orange-600">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <TypeIcon size={20} className="text-orange-600" />
          </div>
          {getTypeLabel(type)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fine Weight Output - Highlighted */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
          <div className="text-orange-600 font-medium mb-2">Fine Weight Output</div>
          <div className="text-4xl font-bold text-orange-600">{fineGold}g</div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground font-medium">Old Weight:</span>
            <span className="font-semibold">{weight}g</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground font-medium">Original Purity:</span>
            <span className="font-semibold">{purity}%</span>
          </div>
          
          {type === 'EXCHANGE' && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">Reduction:</span>
                <span className="font-semibold">{reduction || 0}%</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">Adjusted Purity:</span>
                <span className="font-semibold">{adjustedPurity}%</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground font-medium">Fine Weight:</span>
            <Badge className="bg-gray-800 text-white hover:bg-gray-700">
              {fineGold}g
            </Badge>
          </div>
          
          {type !== 'EXCHANGE' && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-medium">Rate:</span>
              <span className="font-semibold">₹{rate}/g</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground font-medium">Payment:</span>
            {type === 'EXCHANGE' ? (
              <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                Fine Gold
              </Badge>
            ) : (
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                ₹{amount.toLocaleString()}
              </Badge>
            )}
          </div>
          
          {remainingFineGold && remainingFineGold > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-medium">Remaining Fine Gold:</span>
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                {remainingFineGold}g
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}