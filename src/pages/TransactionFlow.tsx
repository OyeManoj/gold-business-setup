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
import { getBusinessProfile } from '@/utils/businessStorage';
import { getReceiptSettings } from '@/utils/receiptSettingsStorage';
import { useTranslation } from '@/utils/translations';
import { validateTransactionForm, FormData } from '@/utils/formValidation';
import { ArrowLeft, Check, X, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DayAveragePrices } from '@/components/DayAveragePrices';
import { formatWeight, formatIndianCurrency } from '@/utils/indianFormatting';

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
      id: isEditMode ? editingTransaction!.id : crypto.randomUUID(),
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
      
      // Get business profile and receipt settings for receipt generation
      const businessProfile = await getBusinessProfile();
      const receiptSettings = await getReceiptSettings();
      
      const receiptText = generateReceiptText(transaction, language, businessProfile, receiptSettings);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-off-white to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 flex flex-col min-h-screen">
        {/* Mobile-first Compact Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 flex-shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-white/80 hover:shadow-sm transition-all duration-200 min-h-[36px] sm:min-h-[40px] touch-manipulation"
            >
              <ArrowLeft size={16} className="sm:hidden" />
              <ArrowLeft size={18} className="hidden sm:block" />
              <span className="font-medium text-sm sm:text-base">{t.back}</span>
            </Button>
          </div>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        <div className="w-full flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 flex-1">
            {/* Mobile-first Compact Input Form */}
            <Card className="h-fit lg:h-full border-2 border-border shadow-xl bg-white/95 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2 sm:pb-3 md:pb-4 bg-gradient-to-r from-white/80 to-off-white/80 rounded-t-xl border-b-2 border-border/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Badge className={`${getTransactionColor(transactionType)} text-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold rounded-lg shadow-sm border border-white/20`}>
                    {t[transactionType.toLowerCase() as keyof typeof t]}
                  </Badge>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-dark tracking-tight">
                  {isEditMode ? 'Edit Transaction' : 'Transaction Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                {/* Average Prices Display */}
                <DayAveragePrices transactionType={transactionType} />
                
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

                {/* Mobile-optimized Calculate Button */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleCalculate}
                  className="w-full py-3 sm:py-2.5 text-sm sm:text-base font-bold rounded-lg bg-gradient-to-r from-dark to-charcoal hover:from-charcoal hover:to-dark shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] touch-manipulation min-h-[44px] sm:min-h-[40px]"
                  disabled={
                    !formData.weight || 
                    (transactionType !== 'EXCHANGE' && !formData.rate)
                  }
                >
                  <Calculator size={16} className="mr-2" />
                  <span className="text-sm sm:text-base">{isEditMode ? 'Update Transaction' : 'Calculate Transaction'}</span>
                </Button>
              </CardContent>
            </Card>


            {/* Summary Panel */}
            {showSummary && calculation && (
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
                isEditMode={isEditMode}
                onConfirm={handleConfirm}
                onEdit={() => setShowSummary(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}