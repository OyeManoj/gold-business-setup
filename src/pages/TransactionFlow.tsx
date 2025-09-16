import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TransactionType, Transaction } from '@/types/transaction';
import { calculateTransaction } from '@/utils/calculations';
import { saveTransaction, updateTransaction, getTransactions } from '@/utils/storage';
import { generateReceiptText, printReceipt } from '@/utils/receipt';
import { getBusinessProfile } from '@/utils/businessStorage';
import { getReceiptSettings } from '@/utils/receiptSettingsStorage';
import { useTranslation } from '@/utils/translations';
import { validateTransactionForm, FormData } from '@/utils/formValidation';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { TransactionForm } from '@/components/TransactionForm';
import { LiveCalculation } from '@/components/LiveCalculation';
import type { BusinessProfile } from '@/types/business';
import type { ReceiptSettings } from '@/types/receiptSettings';

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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [calculation, setCalculation] = useState<any>(null);
  const [businessProfileState, setBusinessProfileState] = useState<BusinessProfile | undefined>(undefined);
  const [receiptSettingsState, setReceiptSettingsState] = useState<ReceiptSettings | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const [bp, rs] = await Promise.all([getBusinessProfile(), getReceiptSettings()]);
        setBusinessProfileState(bp);
        setReceiptSettingsState(rs);
      } catch (e) {
        console.error('Failed to preload receipt dependencies', e);
      }
    })();
  }, []);

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
        const calc = calculateTransaction(
          transactionType,
          parseFloat(formData.weight || '0'),
          parseFloat(formData.purity || '0'),
          parseFloat(formData.rate || '0'),
          parseFloat(formData.reduction || '0')
        );
        setCalculation(calc);
      } else {
        setCalculation(null);
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent, nextField?: string) => {
    if (e.key === 'Enter' && nextField) {
      e.preventDefault();
      const nextElement = document.getElementById(nextField);
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleConfirm = async () => {
    if (!validateForm() || !calculation) return;

    try {
      const transaction: Transaction = {
        id: editingTransaction?.id || crypto.randomUUID(),
        type: transactionType,
        weight: parseFloat(formData.weight),
        purity: transactionType !== 'SALE' ? parseFloat(formData.purity) : 100,
        reduction: transactionType === 'EXCHANGE' ? parseFloat(formData.reduction) : undefined,
        rate: parseFloat(formData.rate),
        fineGold: calculation.fineGold,
        amount: calculation.amount,
        date: editingTransaction?.date || new Date(),
      };

      // Trigger printing immediately (within user gesture)
      try {
        const receiptText = generateReceiptText(transaction, language, businessProfileState, receiptSettingsState);
        printReceipt(receiptText);
        console.log('Receipt printing initiated for transaction:', transaction.id);
      } catch (printError) {
        console.error('Receipt printing failed:', printError);
        toast({
          title: "Print Notice",
          description: "Receipt printing failed. You can print it later from History.",
          variant: "default",
        });
      }

      if (isEditMode && editingTransaction) {
        await updateTransaction(transaction);
        await logTransaction('update', transaction, editingTransaction);
        toast({
          title: "Transaction Updated",
          description: "Transaction has been successfully updated.",
        });
      } else {
        await saveTransaction(transaction);
        await logTransaction('create', transaction);
        toast({
          title: "Transaction Saved",
          description: "Transaction has been successfully saved.",
        });
      }

      navigate('/history');
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'EXCHANGE': return 'bg-primary text-primary-foreground';
      case 'PURCHASE': return 'bg-primary text-primary-foreground';
      case 'SALE': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-12 md:px-24 lg:px-32 xl:px-48 py-4 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 text-foreground font-medium"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{language === 'ar' ? 'رجوع' : 'Back'}</span>
            </Button>
          </div>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Main Content - Compact Centered Layout */}
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-1 px-4 md:px-8">
            {/* Transaction Form */}
            <TransactionForm
              transactionType={transactionType}
              formData={formData}
              errors={errors}
              calculation={calculation}
              isEditMode={isEditMode}
              language={language as 'en' | 'ar'}
              onInputChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onConfirm={handleConfirm}
              getTransactionColor={getTransactionColor}
            />

            {/* Live Calculation */}
            {calculation && (
              <LiveCalculation
                transactionType={transactionType}
                formData={formData}
                calculation={calculation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}