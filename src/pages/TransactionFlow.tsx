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
      case 'EXCHANGE': return 'bg-blue-500';
      case 'PURCHASE': return 'bg-green-500';
      case 'SALE': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-light/20 via-blue-light/10 to-green-light/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-purple hover:text-purple hover:bg-purple/10"
          >
            <ArrowLeft size={16} />
            <span className="font-medium">{t.back}</span>
          </Button>
          
          <div className="p-1 bg-gradient-to-r from-purple to-blue rounded-2xl">
            <div className="bg-background rounded-xl">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <Card className="h-fit border-0 shadow-elegant bg-gradient-to-br from-card via-card to-white backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${getTransactionColor(transactionType)} text-white px-4 py-2 text-sm font-semibold rounded-xl shadow-md`}>
                    {t[transactionType.toLowerCase() as keyof typeof t]}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                  {isEditMode ? 'Edit Transaction' : 'Transaction Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
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
                  className="w-full h-16 text-lg font-semibold tracking-wide shadow-orange"
                  disabled={
                    !formData.weight || 
                    (transactionType !== 'EXCHANGE' && !formData.rate)
                  }
                >
                  <Calculator size={24} className="mr-3" />
                  {isEditMode ? 'Update Transaction' : 'Calculate Transaction'}
                </Button>
              </CardContent>
            </Card>

            {/* Live Calculation Display */}
            {liveCalculation && !showSummary && (
              <Card className="bg-gradient-to-br from-purple/5 via-blue/5 to-green/5 border-2 border-purple/20 shadow-elegant backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-center font-bold flex items-center justify-center gap-3 text-purple">
                    <Calculator size={24} className="text-purple" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-6">
                    <div className="p-8 bg-gradient-to-br from-purple/10 to-blue/10 rounded-2xl border-2 border-purple/20 shadow-md">
                      <div className="text-sm font-medium text-muted-foreground mb-3">Fine Gold Output</div>
                      <div className="text-4xl font-bold text-purple">{liveCalculation.fineGold} g</div>
                    </div>
                    {transactionType !== 'EXCHANGE' && liveCalculation.amount && (
                      <div className="p-8 bg-gradient-to-br from-green/10 to-emerald/10 rounded-2xl border-2 border-green/20 shadow-md">
                        <div className="text-sm font-medium text-muted-foreground mb-3">Total Amount</div>
                        <div className="text-3xl font-bold text-green">₹{liveCalculation.amount.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                  <div className="pt-6 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple/10 to-blue/10 rounded-full border border-purple/20">
                      <div className="w-3 h-3 bg-purple rounded-full animate-pulse"></div>
                      <span className="text-sm text-purple font-semibold">Updates live as you type</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Panel */}
            {showSummary && calculation && (
              <div className="space-y-8">
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
                <div className="flex gap-6">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirm}
                    className="flex-1 h-16 text-lg font-semibold tracking-wide shadow-green"
                  >
                    <Check size={24} className="mr-3" />
                    {isEditMode ? 'Update' : t.confirm}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowSummary(false)}
                    className="flex-1 h-16 text-lg font-medium"
                  >
                    <X size={24} className="mr-3" />
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