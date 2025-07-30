import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TransactionType } from "@/types/transaction";

interface TransactionSummaryProps {
  type: TransactionType;
  weight: number;
  purity: number;
  rate: number;
  fineGold: number;
  amount: number;
  reduction?: number;
  cashPaid?: number;
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
  cashPaid,
  remainingFineGold,
}: TransactionSummaryProps) {
  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return 'bg-blue-100 text-blue-800';
      case 'PURCHASE': return 'bg-green-100 text-green-800';
      case 'SALE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gold-light/30 to-background border-2 border-gold/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Transaction Summary</CardTitle>
          <Badge className={getTypeColor(type)}>{type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Input Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{weight} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purity:</span>
              <span className="font-medium">{purity}%</span>
            </div>
            {reduction !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reduction:</span>
                <span className="font-medium">{reduction}%</span>
              </div>
            )}
            {type !== 'EXCHANGE' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">₹{rate}/g</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Calculated Results */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Calculated Results
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
              <span className="font-medium">Fine Gold:</span>
              <span className="text-lg font-bold text-primary">{fineGold} g</span>
            </div>
            {type !== 'EXCHANGE' && (
              <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">₹{amount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cash Payment Details */}
        {cashPaid && cashPaid > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Payment Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                  <span className="font-medium">Cash Paid:</span>
                  <span className="text-lg font-bold text-blue-600">₹{cashPaid.toLocaleString()}</span>
                </div>
                {remainingFineGold && remainingFineGold > 0 && (
                  <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                    <span className="font-medium">Remaining Fine Gold:</span>
                    <span className="text-lg font-bold text-orange-600">{remainingFineGold} g</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}