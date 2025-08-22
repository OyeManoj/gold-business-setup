import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransactionType } from "@/types/transaction";
import { formatIndianCurrency, formatIndianRate, formatWeight, formatPercentage } from '@/utils/indianFormatting';
import { Check, X } from 'lucide-react';

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
  isEditMode?: boolean;
  onConfirm: () => void;
  onEdit: () => void;
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
  isEditMode,
  onConfirm,
  onEdit,
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
    <Card className="h-full bg-gradient-to-br from-gold-light/30 to-background border-2 border-gold/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Transaction Summary</CardTitle>
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
                <span className="font-medium">{formatWeight(weight)} g</span>
            </div>
            <div className="flex justify-between">
                  <span className="text-muted-foreground">Purity:</span>
                  <span className="font-medium">{formatPercentage(purity)}%</span>
            </div>
            {reduction !== undefined && (
              <div className="flex justify-between">
                    <span className="text-muted-foreground">Reduction:</span>
                    <span className="font-medium">{formatPercentage(reduction)}%</span>
              </div>
            )}
            {type !== 'EXCHANGE' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">{formatIndianRate(rate)}</span>
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
              <span className="font-medium text-sm">Fine Gold:</span>
              <span className="text-base font-bold text-primary">{formatWeight(fineGold)} g</span>
            </div>
            {type !== 'EXCHANGE' && (
              <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                <span className="font-medium text-sm">Total Amount:</span>
                <span className="text-base font-bold text-green-600">{formatIndianCurrency(amount)}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <Button
            variant="success"
            size="lg"
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
          >
            <Check size={16} className="mr-2" />
            {isEditMode ? 'UPDATE' : 'CONFIRM & PRINT'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onEdit}
            className="flex-1 py-2.5 text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
          >
            <X size={16} className="mr-2" />
            EDIT
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}