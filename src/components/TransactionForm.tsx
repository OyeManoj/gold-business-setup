import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessInput } from '@/components/BusinessInput';
import { DayAveragePrices } from '@/components/DayAveragePrices';
import { Check } from 'lucide-react';
import { TransactionType } from '@/types/transaction';
import { formatWeight } from '@/utils/indianFormatting';
import { useTranslation } from '@/utils/translations';
import { Language } from '@/components/LanguageToggle';

interface FormData {
  weight: string;
  purity: string;
  reduction: string;
  rate: string;
}

interface FormErrors {
  weight?: string;
  purity?: string;
  reduction?: string;
  rate?: string;
}

interface Calculation {
  fineGold: number;
  amount: number;
}

interface TransactionFormProps {
  transactionType: TransactionType;
  formData: FormData;
  errors: FormErrors;
  calculation: Calculation | null;
  isEditMode: boolean;
  language: Language;
  onInputChange: (field: string, value: string) => void;
  onKeyPress: (e: React.KeyboardEvent, nextField?: string) => void;
  onConfirm: () => void;
  getTransactionColor: (type: TransactionType) => string;
}

export const TransactionForm = ({
  transactionType,
  formData,
  errors,
  calculation,
  isEditMode,
  language,
  onInputChange,
  onKeyPress,
  onConfirm,
  getTransactionColor
}: TransactionFormProps) => {
  const t = useTranslation(language);

  return (
    <Card className="h-fit border border-border bg-card rounded-lg">
      <CardHeader className="pb-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${getTransactionColor(transactionType)} text-white px-3 py-1 text-sm font-medium rounded-md`}>
              {t[transactionType.toLowerCase() as keyof typeof t]}
            </Badge>
            {isEditMode && (
              <CardTitle className="text-lg font-semibold text-foreground">
                Edit Transaction
              </CardTitle>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        {/* Average Prices Display */}
        <DayAveragePrices transactionType={transactionType} />

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Weight Input */}
          <BusinessInput
            id="weight"
            label={transactionType === 'EXCHANGE' ? 'Old Gold Weight (g)' : `${t.weight} (g)`}
            type="number"
            step="0.001"
            min="0"
            value={formData.weight}
            onChange={(e) => onInputChange('weight', e.target.value)}
            onKeyPress={(e) => onKeyPress(e, transactionType !== 'SALE' ? 'purity' : 'rate')}
            error={errors.weight}
            placeholder="0.000"
            autoFocus
          />

          {/* Purity Input (not for Sale) */}
          {transactionType !== 'SALE' && (
            <BusinessInput
              id="purity"
              label="Purity (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.purity}
              onChange={(e) => onInputChange('purity', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, transactionType === 'EXCHANGE' ? 'reduction' : 'rate')}
              error={errors.purity}
              placeholder="91.6"
            />
          )}

          {/* Reduction Input (only for Exchange) */}
          {transactionType === 'EXCHANGE' && (
            <BusinessInput
              id="reduction"
              label="Reduction (%)"
              type="number"
              step="0.1"
              min="0"
              value={formData.reduction}
              onChange={(e) => onInputChange('reduction', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'fineWeight')}
              error={errors.reduction}
              placeholder="0.03"
            />
          )}

          {/* Rate Input (not for Exchange) */}
          {transactionType !== 'EXCHANGE' && (
            <BusinessInput
              id="rate"
              label={`Rate (${t.rupees}/g)`}
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={(e) => onInputChange('rate', e.target.value)}
              onKeyPress={(e) => onKeyPress(e)}
              error={errors.rate}
              placeholder="Enter current gold rate"
            />
          )}

          {/* Fine Weight Display (for Exchange) */}
          {transactionType === 'EXCHANGE' && calculation && (
            <div className="bg-muted border border-border rounded-lg p-3">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Fine Weight (g)
              </label>
              <div className="h-10 px-3 py-2 border border-border rounded-lg bg-card text-foreground font-semibold text-base flex items-center">
                {formatWeight(calculation.fineGold)}
              </div>
            </div>
          )}
        </div>

        {/* Complete Transaction Button */}
        {calculation && (
          <Button
            onClick={onConfirm}
            className="w-full h-12 text-base font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
          >
            <Check size={18} className="mr-2" />
            <span>
              {isEditMode ? 'Update Transaction' : 'Complete Transaction'}
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};