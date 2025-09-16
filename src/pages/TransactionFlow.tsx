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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted hover:shadow-soft transition-all duration-200 text-foreground font-medium"
            >
              <ArrowLeft size={18} />
              <span className="text-sm sm:text-base">{t.back}</span>
            </Button>
          </div>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        <div className="w-full flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 flex-1">
            {/* Enhanced Input Form */}
            <Card className="h-fit lg:h-full lg:col-span-3 border border-border shadow-lg bg-card backdrop-blur-sm rounded-lg">
              <CardHeader className="pb-2 bg-gradient-to-r from-card to-muted/50 rounded-t-lg border-b border-border px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${getTransactionColor(transactionType)} text-white px-3 py-1.5 text-sm font-semibold rounded-md shadow-sm`}>
                    {t[transactionType.toLowerCase() as keyof typeof t]}
                  </Badge>
                </div>
                 <CardTitle className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                   {isEditMode ? 'Edit Transaction' : ''}
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-4">
                {/* Average Prices Display */}
                <DayAveragePrices transactionType={transactionType} />

                {/* Transaction Details Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2 mb-4">
                    {transactionType === 'EXCHANGE' ? 'Gold Exchange Details' : 
                     transactionType === 'PURCHASE' ? 'Gold Purchase Details' : 'Gold Sale Details'}
                  </h3>

                  <div className="space-y-4">
                    {/* Weight Input */}
                    <BusinessInput
                      id="weight"
                      label={transactionType === 'EXCHANGE' ? 'Old Gold Weight (g)' : `${t.weight} (g)`}
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, transactionType !== 'SALE' ? 'purity' : 'rate')}
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
                        onChange={(e) => handleInputChange('purity', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, transactionType === 'EXCHANGE' ? 'reduction' : 'rate')}
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
                        onChange={(e) => handleInputChange('reduction', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'fineWeight')}
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
                        onChange={(e) => handleInputChange('rate', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e)}
                        error={errors.rate}
                        placeholder="Enter current gold rate"
                      />
                    )}

                    {/* Fine Weight Display (for Exchange) */}
                    {transactionType === 'EXCHANGE' && calculation && (
                      <div className="bg-muted/30 border border-border rounded-lg p-3">
                        <label className="text-sm font-semibold text-foreground mb-3 block">
                          Fine Weight (g)
                        </label>
                        <div className="h-12 px-4 py-3 border border-border/50 rounded-lg bg-card text-foreground font-semibold text-lg flex items-center">
                          {formatWeight(calculation.fineGold)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* One-Touch Complete Transaction Button */}
                {calculation && (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleConfirm}
                    className="w-full h-14 text-lg font-semibold rounded-lg bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success/80 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] focus:ring-2 focus:ring-success/30 focus:ring-offset-2"
                  >
                    <Check size={20} className="mr-3" />
                    <span className="text-lg">
                      {isEditMode ? 'Update Transaction' : `Complete Transaction ${formatIndianCurrency(calculation.amount)}`}
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>


            {/* Enhanced Live Calculation Summary */}
{calculation && (
  <Card className="h-fit border border-border bg-card backdrop-blur-sm rounded-lg shadow-sm">
    <CardHeader className="pb-2 pt-2 px-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-muted text-foreground px-2 py-1 text-xs font-medium rounded-md">
          CALC
        </Badge>
        <CardTitle className="text-base font-semibold text-foreground">
          {transactionType === 'EXCHANGE' ? 'Exchange Summary' : 
           transactionType === 'PURCHASE' ? 'Purchase Summary' : 'Sale Summary'}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-3 px-3 pb-3">
      {/* Main Output */}
      <div className="bg-muted border border-border rounded-lg p-3 text-center">
        <div className="text-xs font-medium text-foreground/70 mb-1">
          {transactionType === 'EXCHANGE' ? 'Fine Weight Output' : 
           transactionType === 'PURCHASE' ? 'Fine Gold Purchased' : 'Total Amount'}
        </div>
        <div className="text-2xl font-bold text-foreground">
          {transactionType !== 'SALE' ? formatWeight(calculation.fineGold) : formatIndianCurrency(calculation.amount)}
        </div>
        {transactionType !== 'SALE' && (
          <div className="text-xs text-muted-foreground mt-1">grams</div>
        )}
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1">
          <span className="text-xs font-medium text-muted-foreground">
            {transactionType === 'EXCHANGE' ? 'Old Weight:' : 'Weight:'}
          </span>
          <span className="text-xs font-semibold text-foreground">
            {formatWeight(parseFloat(formData.weight || '0'))}g
          </span>
        </div>

        {transactionType !== 'SALE' && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-muted-foreground">
              {transactionType === 'EXCHANGE' ? 'Original Purity:' : 'Purity:'}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {formatPercentage(parseFloat(formData.purity || '0'))}%
            </span>
          </div>
        )}

        {transactionType === 'EXCHANGE' && (
          <>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-medium text-muted-foreground">Reduction:</span>
              <span className="text-xs font-semibold text-foreground">
                {formatPercentage(parseFloat(formData.reduction || '0'))}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-medium text-muted-foreground">Adjusted Purity:</span>
              <span className="text-xs font-semibold text-foreground">
                {formatPercentage(parseFloat(formData.purity || '0') - parseFloat(formData.reduction || '0'))}%
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between items-center py-1">
          <span className="text-xs font-medium text-muted-foreground">Fine Weight:</span>
          <span className="text-xs font-semibold text-foreground">
            <Badge className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded-md shadow-sm">
              {formatWeight(calculation.fineGold)}g
            </Badge>
          </span>
        </div>

        {transactionType !== 'EXCHANGE' && (
          <>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-medium text-muted-foreground">Rate:</span>
              <span className="text-xs font-semibold text-foreground">
                {formatIndianRate(parseFloat(formData.rate || '0'))}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-medium text-muted-foreground">Total Amount:</span>
              <span className="text-xs font-semibold text-foreground">
                {formatIndianCurrency(calculation.amount)}
              </span>
            </div>
          </>
        )}
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