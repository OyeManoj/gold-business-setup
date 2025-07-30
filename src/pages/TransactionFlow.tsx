import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessInput } from '@/components/BusinessInput';
import { TransactionSummary } from '@/components/TransactionSummary';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { TransactionType, Transaction } from '@/types/transaction';
import { calculateTransaction } from '@/utils/calculations';
import { saveTransaction, updateTransaction, getTransactions } from '@/utils/storage';
import { generateReceiptText, printReceipt } from '@/utils/receipt';
import { useTranslation } from '@/utils/translations';
import { validateTransactionForm, FormData } from '@/utils/formValidation';
import { useLiveCalculation } from '@/hooks/useLiveCalculation';
import { ArrowLeft, Check, X, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function TransactionFlow() {
  const { type, transactionId } = useParams<{ type: string; transactionId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    purity: '',
    reduction: '',
    rate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const t = useTranslation(language);
  const transactionType = type?.toUpperCase() as TransactionType;
  const isEditMode = transactionId !== undefined;

  // Load transaction for editing
  useEffect(() => {
    if (isEditMode && transactionId) {
      const transactions = getTransactions();
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setEditingTransaction(transaction);
        setFormData({
          weight: transaction.weight.toString(),
          purity: transaction.purity?.toString() || '',
          reduction: transaction.reduction?.toString() || '',
          rate: transaction.rate.toString(),
        });
      }
    }
  }, [isEditMode, transactionId]);

  const liveCalculation = useLiveCalculation(formData, transactionType);

  // Validation
  const validateForm = () => {
    const newErrors = validateTransactionForm(formData, transactionType);
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
      id: isEditMode ? editingTransaction!.id : Date.now().toString(),
      type: transactionType,
      weight: parseFloat(formData.weight),
      purity: transactionType === 'SALE' ? 100 : parseFloat(formData.purity),
      reduction: transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined,
      rate: transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate),
      
      date: isEditMode ? editingTransaction!.date : new Date(),
      ...calculateTransaction(
        transactionType,
        parseFloat(formData.weight),
        transactionType === 'SALE' ? 100 : parseFloat(formData.purity),
        transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate),
        transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined
      )
    };

    if (isEditMode) {
      updateTransaction(transaction);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
        variant: "default"
      });
    } else {
      saveTransaction(transaction);
      const receiptText = generateReceiptText(transaction, language);
      printReceipt(receiptText);
      toast({
        title: "Success",
        description: "Transaction completed and receipt printed",
        variant: "default"
      });
    }

    navigate('/');
  };
  const calculation = showSummary ? calculateTransaction(
    transactionType,
    parseFloat(formData.weight),
    transactionType === 'SALE' ? 100 : parseFloat(formData.purity),
    transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate),
    transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined
  ) : null;

  if (!transactionType || !['EXCHANGE', 'PURCHASE', 'SALE'].includes(transactionType)) {
    navigate('/');
    return null;
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return 'bg-gold';
      case 'PURCHASE': return 'bg-bronze';
      case 'SALE': return 'bg-navy';
      default: return 'bg-charcoal';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="font-medium">{t.back}</span>
          </Button>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="h-fit border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`${getTransactionColor(transactionType)} text-white px-3 py-1 text-sm font-semibold rounded-lg`}>
                    {t[transactionType.toLowerCase() as keyof typeof t]}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {isEditMode ? 'Edit Transaction' : 'Transaction Details'}
                </CardTitle>
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

                {/* Calculate Button */}
                <Button
                  variant="premium"
                  size="lg"
                  onClick={handleCalculate}
                  className="w-full"
                  disabled={
                    !formData.weight || 
                    (transactionType !== 'EXCHANGE' && !formData.rate)
                  }
                >
                  <Calculator size={20} className="mr-2" />
                  {isEditMode ? 'Update Transaction' : 'Calculate Transaction'}
                </Button>
              </CardContent>
            </Card>

            {/* Live Calculation Display */}
            {liveCalculation && !showSummary && (
              <Card className="bg-gold/5 border-2 border-gold/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-center font-bold flex items-center justify-center gap-2 text-gold">
                    <Calculator size={20} className="text-gold" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-gold/10 rounded-lg border border-gold/20">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Fine Gold Output</div>
                      <div className="text-3xl font-bold text-gold">{liveCalculation.fineGold} g</div>
                    </div>
                    {transactionType !== 'EXCHANGE' && liveCalculation.amount && (
                      <div className="p-6 bg-bronze/10 rounded-lg border border-bronze/20">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Total Amount</div>
                        <div className="text-2xl font-bold text-bronze">₹{liveCalculation.amount.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                      <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                      <span className="text-xs text-gold font-semibold">Updates live</span>
                    </div>
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
                  remainingFineGold={calculation.remainingFineGold}
                  language={language}
                />

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirm}
                    className="flex-1"
                  >
                    <Check size={20} className="mr-2" />
                    {isEditMode ? 'Update' : t.confirm}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowSummary(false)}
                    className="flex-1"
                  >
                    <X size={20} className="mr-2" />
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