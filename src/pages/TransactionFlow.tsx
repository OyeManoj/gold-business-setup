import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { useAuditLog } from '@/hooks/useAuditLog';
import { Badge } from '@/components/ui/badge';
import { DayAveragePrices } from '@/components/DayAveragePrices';
import { formatWeight, formatIndianCurrency, formatPercentage, formatIndianRate } from '@/utils/indianFormatting';

export default function TransactionFlow() {
  const { type, transactionId } = useParams<{ type: string; transactionId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logTransaction } = useAuditLog();
  
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
  const [calculation, setCalculation] = useState<any>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const t = useTranslation(language);
  const transactionType = type?.toUpperCase() as TransactionType;
  const isEditMode = transactionId !== undefined;

  // Load transaction for editing or pre-populate from URL params
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
      } else {
        // Pre-populate from URL parameters for quick actions
        const urlParams = new URLSearchParams(location.search);
        const newFormData: FormData = {
          weight: urlParams.get('weight') || '',
          purity: urlParams.get('purity') || '',
          reduction: urlParams.get('reduction') || '',
          rate: urlParams.get('rate') || '',
        };
        
        // Only update if there are parameters to avoid overriding user input
        if (Object.values(newFormData).some(value => value !== '')) {
          setFormData(newFormData);
        }
      }
    };
    loadTransaction();
  }, [isEditMode, transactionId, location.search]);

  

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
    
    // Auto-calculate when form is valid
    setTimeout(() => {
      const newErrors = validateTransactionForm({ ...formData, [field]: value }, transactionType);
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        try {
          const calc = calculateTransaction(
            transactionType,
            parseFloat(formData.weight || (field === 'weight' ? value : '0')),
            transactionType === 'SALE' ? 100 : parseFloat(formData.purity || (field === 'purity' ? value : '0')),
            transactionType === 'EXCHANGE' ? 1 : parseFloat(formData.rate || (field === 'rate' ? value : '0')),
            transactionType === 'EXCHANGE' ? parseFloat(formData.reduction || (field === 'reduction' ? value : '0')) : undefined
          );
          setCalculation(calc);
          setShowSummary(true);
        } catch (error) {
          setCalculation(null);
          setShowSummary(false);
        }
      } else {
        setCalculation(null);
        setShowSummary(false);
      }
    }, 300);
  };

  const handleCalculate = () => {
    if (validateForm()) {
      setShowSummary(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, nextField?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextField) {
        const nextInput = document.getElementById(nextField);
        nextInput?.focus();
      } else if (calculation && !errors.weight && !errors.purity && !errors.rate && !errors.reduction) {
        handleConfirm();
      }
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
      // Log transaction update
      await logTransaction('update', transaction, editingTransaction);
      toast({
        title: "Success",
        description: "Transaction updated and synced across all devices",
        variant: "default"
      });
    } else {
      await saveTransaction(transaction);
      // Log transaction creation
      await logTransaction('create', transaction);
      
      // Get business profile and receipt settings for receipt generation
      const businessProfile = await getBusinessProfile();
      const receiptSettings = await getReceiptSettings();
      
      const receiptText = generateReceiptText(transaction, language, businessProfile, receiptSettings);
      printReceipt(receiptText);
      toast({
        title: "Success",
        description: "Transaction completed, receipt printed, and synced across all devices",
        variant: "default"
      });
    }

    navigate('/');
  };

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
                  onKeyPress={(e) => handleKeyPress(e, transactionType !== 'SALE' ? 'purity' : 'rate')}
                  error={errors.weight}
                  placeholder="Enter weight"
                  autoFocus
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
                    onKeyPress={(e) => handleKeyPress(e, transactionType === 'EXCHANGE' ? 'reduction' : 'rate')}
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
                    onKeyPress={(e) => handleKeyPress(e)}
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
                    onKeyPress={(e) => handleKeyPress(e)}
                    error={errors.rate}
                    placeholder="Enter current gold rate"
                  />
                )}

                {/* One-Touch Complete Transaction Button */}
                {calculation && (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleConfirm}
                    className="w-full py-3 sm:py-2.5 text-sm sm:text-base font-bold rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] touch-manipulation min-h-[44px] sm:min-h-[40px]"
                  >
                    <Check size={16} className="mr-2" />
                    <span className="text-sm sm:text-base">
                      {isEditMode ? 'Update Transaction' : `Complete Transaction ${formatIndianCurrency(calculation.amount)}`}
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>


            {/* Live Calculation Preview */}
{calculation && (
  <Card className="h-fit border-2 border-green-200 bg-green-50/80 dark:bg-green-900/20 dark:border-green-800">
    <CardContent className="p-4">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">Fine Gold:</span>
            <span className="text-lg font-bold text-green-900 dark:text-green-100">
              {formatWeight(calculation.fineGold)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">Total Amount:</span>
            <span className="text-xl font-bold text-green-900 dark:text-green-100">
              {formatIndianCurrency(calculation.amount)}
            </span>
          </div>
        </div>

        <div className="h-px bg-green-200/60 dark:bg-green-800/60" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-green-800/90 dark:text-green-200/90">Weight</span>
            <span className="font-semibold text-green-900 dark:text-green-100">{formatWeight(parseFloat(formData.weight || '0'))} g</span>
          </div>
          {transactionType !== 'SALE' && (
            <div className="flex items-center justify-between">
              <span className="text-green-800/90 dark:text-green-200/90">Purity</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatPercentage(parseFloat(formData.purity || '0'))} %</span>
            </div>
          )}
          {transactionType === 'EXCHANGE' && (
            <div className="flex items-center justify-between">
              <span className="text-green-800/90 dark:text-green-200/90">Reduction</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatPercentage(parseFloat(formData.reduction || '0'))} %</span>
            </div>
          )}
          {transactionType !== 'EXCHANGE' && (
            <div className="flex items-center justify-between">
              <span className="text-green-800/90 dark:text-green-200/90">Rate</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatIndianRate(parseFloat(formData.rate || '0'))}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-green-900/70 dark:text-green-200/70">
          {transactionType === 'EXCHANGE' && (
            <div>
              Formula: Fine = Weight × (Purity − Reduction) / 100
            </div>
          )}
          {transactionType === 'PURCHASE' && (
            <div>
              Formula: Fine = Weight × Purity / 100
            </div>
          )}
          {transactionType === 'SALE' && (
            <div>
              Formula: Amount = Weight × Rate
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)}
          </div>
        </div>
      </div>
    </div>
  );
}