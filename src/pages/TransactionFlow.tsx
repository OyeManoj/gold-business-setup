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
    const loadTransaction = async () => {
      if (isEditMode && transactionId) {
        const transactions = await getTransactions();
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
    };
    loadTransaction();
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

  const handleConfirm = async () => {
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
      await updateTransaction(transaction);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
        variant: "default"
      });
    } else {
      await saveTransaction(transaction);
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
      case 'EXCHANGE': return 'bg-accent-1';
      case 'PURCHASE': return 'bg-accent-2';
      case 'SALE': return 'bg-accent-3';
      default: return 'bg-charcoal';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="h-fit border-0 shadow-sm bg-white">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${getTransactionColor(transactionType)} text-white px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm`}>
                    {t[transactionType.toLowerCase() as keyof typeof t]}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-medium text-foreground">
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
                  variant="default"
                  size="lg"
                  onClick={handleCalculate}
                  className="w-full"
                  disabled={
                    !formData.weight || 
                    (transactionType !== 'EXCHANGE' && !formData.rate)
                  }
                >
                  <Calculator size={18} className="mr-2" />
                  {isEditMode ? 'Update Transaction' : 'Calculate Transaction'}
                </Button>
              </CardContent>
            </Card>

            {/* Live Calculation Display */}
            {liveCalculation && !showSummary && (
              <Card className="bg-white border-2 border-dark/30 shadow-xl">
                <CardHeader className="pb-6 bg-off-white rounded-t-xl">
                  <CardTitle className="text-xl text-center font-bold flex items-center justify-center gap-3 text-dark">
                    <Calculator size={22} className="text-dark drop-shadow-sm" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="text-center space-y-5">
                    <div className="p-8 bg-white rounded-2xl border-3 border-dark/30 shadow-lg">
                      <div className="text-sm font-bold text-dark mb-3 uppercase tracking-wide">Fine Gold Output</div>
                      <div className="text-4xl font-bold text-dark drop-shadow-sm">{liveCalculation.fineGold} g</div>
                    </div>
                    {transactionType !== 'EXCHANGE' && liveCalculation.amount && (
                      <div className="p-8 bg-white rounded-2xl border-3 border-accent-2/30 shadow-lg">
                        <div className="text-sm font-bold text-accent-2 mb-3 uppercase tracking-wide">Total Amount</div>
                        <div className="text-3xl font-bold text-accent-2 drop-shadow-sm">₹{liveCalculation.amount.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-dark/10 rounded-full border-2 border-dark/30 shadow-md">
                      <div className="w-3 h-3 bg-dark rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-sm text-dark font-bold uppercase tracking-wide">Updates live</span>
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
                    <Check size={18} className="mr-2" />
                    {isEditMode ? 'Update' : t.confirm}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowSummary(false)}
                    className="flex-1"
                  >
                    <X size={18} className="mr-2" />
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