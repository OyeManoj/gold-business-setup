import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessInput } from '@/components/BusinessInput';
import { TransactionSummary } from '@/components/TransactionSummary';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { TransactionType, Transaction } from '@/types/transaction';
import { calculateTransaction } from '@/utils/calculations';
import { saveTransaction } from '@/utils/storage';
import { generateReceiptText, printReceipt } from '@/utils/receipt';
import { useTranslation } from '@/utils/translations';
import { ArrowLeft, Check, X, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function TransactionFlow() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState({
    weight: '',
    purity: '',
    reduction: '',
    rate: '',
    cashPaid: '',
    enableCashPayment: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [liveCalculation, setLiveCalculation] = useState<any>(null);

  const t = useTranslation(language);
  const transactionType = type?.toUpperCase() as TransactionType;

  // Live calculation effect
  useEffect(() => {
    const weight = parseFloat(formData.weight) || 0;
    const purity = transactionType === 'SALE' ? 100 : (parseFloat(formData.purity) || 0);
    const rate = parseFloat(formData.rate) || 0;
    const reduction = transactionType === 'EXCHANGE' ? (parseFloat(formData.reduction) || 0) : 0;
    const cashPaid = formData.enableCashPayment ? (parseFloat(formData.cashPaid) || 0) : 0;

    // For Exchange: show calculation even with partial data
    if (transactionType === 'EXCHANGE') {
      if (weight > 0 || purity > 0 || reduction >= 0) {
        try {
          const result = calculateTransaction(transactionType, weight, purity, 1, reduction, cashPaid);
          setLiveCalculation(result);
        } catch (error) {
          setLiveCalculation(null);
        }
      } else {
        setLiveCalculation(null);
      }
    } else {
      // For Purchase/Sale: show calculation with partial data
      if (weight > 0 || rate > 0 || (transactionType === 'PURCHASE' && purity > 0)) {
        try {
          const result = calculateTransaction(transactionType, weight, purity, rate, reduction, cashPaid);
          setLiveCalculation(result);
        } catch (error) {
          setLiveCalculation(null);
        }
      } else {
        setLiveCalculation(null);
      }
    }
  }, [formData, transactionType]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }
    
    if (transactionType !== 'SALE') {
      if (!formData.purity || parseFloat(formData.purity) <= 0 || parseFloat(formData.purity) > 100) {
        newErrors.purity = 'Purity must be between 1-100%';
      }
    }
    
    if (transactionType === 'EXCHANGE') {
      if (!formData.reduction || parseFloat(formData.reduction) < 0) {
        newErrors.reduction = 'Reduction cannot be negative';
      }
    }
    
    if (transactionType !== 'EXCHANGE') {
      if (!formData.rate || parseFloat(formData.rate) <= 0) {
        newErrors.rate = 'Rate must be greater than 0';
      }
    }
    
    if (transactionType === 'SALE' && formData.enableCashPayment && (!formData.cashPaid || parseFloat(formData.cashPaid) < 0)) {
      newErrors.cashPaid = 'Cash paid cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCalculate = () => {
    if (validateForm()) {
      setShowSummary(true);
    }
  };

  const handleConfirm = () => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      weight: parseFloat(formData.weight),
      purity: transactionType === 'SALE' ? 100 : parseFloat(formData.purity),
      reduction: transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined,
      rate: transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate),
      cashPaid: formData.enableCashPayment ? parseFloat(formData.cashPaid) || 0 : undefined,
      date: new Date(),
      ...calculateTransaction(
        transactionType,
        parseFloat(formData.weight),
        transactionType === 'SALE' ? 100 : parseFloat(formData.purity),
        transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate),
        transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined,
        formData.enableCashPayment ? parseFloat(formData.cashPaid) || 0 : undefined
      )
    };

    saveTransaction(transaction);
    const receiptText = generateReceiptText(transaction, language);
    printReceipt(receiptText);
    
    toast({
      title: "Success",
      description: "Transaction completed and receipt printed",
      variant: "default"
    });

    navigate('/');
  };

  const calculation = showSummary ? calculateTransaction(
    transactionType,
    parseFloat(formData.weight),
    transactionType === 'SALE' ? 100 : parseFloat(formData.purity),
    transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate),
    transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined,
    formData.enableCashPayment ? parseFloat(formData.cashPaid) || 0 : undefined
  ) : null;

  if (!transactionType || !['EXCHANGE', 'PURCHASE', 'SALE'].includes(transactionType)) {
    navigate('/');
    return null;
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return 'bg-blue-500';
      case 'PURCHASE': return 'bg-green-500';
      case 'SALE': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gold-light/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t.back}
          </Button>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className={`${getTransactionColor(transactionType)} text-white`}>
                    {t[transactionType.toLowerCase() as keyof typeof t]}
                  </Badge>
                  <CardTitle className="text-xl">Transaction Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weight Input */}
                <BusinessInput
                  id="weight"
                  label={t.weight}
                  unit={t.grams}
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  error={errors.weight}
                  placeholder="Enter weight"
                />

                {/* Purity Input (not for Sale) */}
                {transactionType !== 'SALE' && (
                  <BusinessInput
                    id="purity"
                    label={t.purity}
                    unit={t.percent}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.purity}
                    onChange={(e) => handleInputChange('purity', e.target.value)}
                    error={errors.purity}
                    placeholder="Enter purity percentage"
                  />
                )}

                {/* Reduction Input (only for Exchange) */}
                {transactionType === 'EXCHANGE' && (
                  <BusinessInput
                    id="reduction"
                    label={t.reduction}
                    unit={t.percent}
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.reduction}
                    onChange={(e) => handleInputChange('reduction', e.target.value)}
                    error={errors.reduction}
                    placeholder="Enter reduction percentage"
                  />
                )}

                {/* Rate Input (not for Exchange) */}
                {transactionType !== 'EXCHANGE' && (
                  <BusinessInput
                    id="rate"
                    label={t.rate}
                    unit={`${t.rupees}/g`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    error={errors.rate}
                    placeholder="Enter current gold rate"
                  />
                )}

                {/* Cash Payment Toggle (only for Sale) */}
                {transactionType === 'SALE' && (
                  <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                    <Switch
                      id="cash-payment"
                      checked={formData.enableCashPayment}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, enableCashPayment: checked, cashPaid: checked ? prev.cashPaid : '' }))
                      }
                    />
                    <Label htmlFor="cash-payment" className="font-medium">
                      {t.partialCash}
                    </Label>
                  </div>
                )}

                {/* Cash Payment Input (only for Sale) */}
                {transactionType === 'SALE' && formData.enableCashPayment && (
                  <BusinessInput
                    id="cashPaid"
                    label={t.cashPaid}
                    unit={t.rupees}
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cashPaid}
                    onChange={(e) => handleInputChange('cashPaid', e.target.value)}
                    error={errors.cashPaid}
                    placeholder="Enter cash amount paid"
                  />
                )}

                {/* Calculate Button */}
                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleCalculate}
                  className="w-full h-12 text-lg"
                  disabled={
                    !formData.weight || 
                    (transactionType !== 'EXCHANGE' && !formData.rate)
                  }
                >
                  <Calculator size={20} className="mr-2" />
                  Calculate Transaction
                </Button>
              </CardContent>
            </Card>

            {/* Live Calculation Display */}
            {liveCalculation && !showSummary && (
              <Card className="bg-gradient-to-br from-gold-light/10 to-background border border-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg text-center">Live Calculation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-card rounded-lg border">
                      <div className="text-sm text-muted-foreground">Fine Gold</div>
                      <div className="text-2xl font-bold text-primary">{liveCalculation.fineGold} g</div>
                    </div>
                    {liveCalculation.remainingFineGold && liveCalculation.remainingFineGold > 0 && (
                      <div className="p-4 bg-card rounded-lg border">
                        <div className="text-sm text-muted-foreground">Remaining Fine Gold</div>
                        <div className="text-xl font-bold text-orange-600">{liveCalculation.remainingFineGold} g</div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 text-center text-sm text-muted-foreground">
                    Values update as you type
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Panel */}
            {showSummary && calculation && (
              <div className="space-y-6">
                <TransactionSummary
                  type={transactionType}
                  weight={parseFloat(formData.weight)}
                  purity={transactionType === 'SALE' ? 100 : parseFloat(formData.purity)}
                  rate={transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate)}
                  fineGold={calculation.fineGold}
                  amount={calculation.amount}
                  reduction={transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined}
                  cashPaid={formData.enableCashPayment ? parseFloat(formData.cashPaid) || 0 : undefined}
                  remainingFineGold={calculation.remainingFineGold}
                  language={language}
                />

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirm}
                    className="flex-1 h-14 text-lg"
                  >
                    <Check size={24} className="mr-2" />
                    {t.confirm}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowSummary(false)}
                    className="flex-1 h-14 text-lg"
                  >
                    <X size={24} className="mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}