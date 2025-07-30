import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NumericKeypad } from '@/components/NumericKeypad';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { TransactionType, Transaction } from '@/types/transaction';
import { calculateTransaction } from '@/utils/calculations';
import { saveTransaction } from '@/utils/storage';
import { generateReceiptText, printReceipt } from '@/utils/receipt';
import { useTranslation } from '@/utils/translations';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const steps = {
  EXCHANGE: ['weight', 'purity', 'reduction', 'rate', 'cash', 'summary'],
  PURCHASE: ['weight', 'purity', 'rate', 'cash', 'summary'],
  SALE: ['weight', 'rate', 'summary']
};

export default function TransactionFlow() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<Language>('en');
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState({
    weight: '',
    purity: '',
    reduction: '',
    rate: '',
    cashPaid: '',
    wantsCash: false
  });

  const t = useTranslation(language);
  const transactionType = type?.toUpperCase() as TransactionType;
  const currentSteps = steps[transactionType] || [];
  const currentStepName = currentSteps[currentStep];

  const handleNext = () => {
    const currentValue = values[currentStepName as keyof typeof values];
    
    if (!currentValue && currentStepName !== 'cash') {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive"
      });
      return;
    }

    if (currentStepName === 'cash' && !values.wantsCash) {
      setCurrentStep(currentStep + 2); // Skip cash input
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleValueChange = (value: string) => {
    setValues(prev => ({
      ...prev,
      [currentStepName]: value
    }));
  };

  const handleCashDecision = (wantsCash: boolean) => {
    setValues(prev => ({ ...prev, wantsCash }));
    if (wantsCash) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentSteps.indexOf('summary'));
    }
  };

  const handleConfirm = () => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      weight: parseFloat(values.weight),
      purity: parseFloat(values.purity) || 100,
      reduction: parseFloat(values.reduction) || undefined,
      rate: parseFloat(values.rate),
      cashPaid: values.wantsCash ? parseFloat(values.cashPaid) || 0 : undefined,
      date: new Date(),
      ...calculateTransaction(
        transactionType,
        parseFloat(values.weight),
        parseFloat(values.purity) || 100,
        parseFloat(values.rate),
        parseFloat(values.reduction) || undefined,
        values.wantsCash ? parseFloat(values.cashPaid) || 0 : undefined
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

  const renderStepContent = () => {
    if (currentStepName === 'summary') {
      const calculation = calculateTransaction(
        transactionType,
        parseFloat(values.weight),
        parseFloat(values.purity) || 100,
        parseFloat(values.rate),
        parseFloat(values.reduction) || undefined,
        values.wantsCash ? parseFloat(values.cashPaid) || 0 : undefined
      );

      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gold-light rounded-lg">
              <span className="font-semibold">{t.fineGold}:</span>
              <span className="text-xl font-bold">{calculation.fineGold} {t.grams}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gold-light rounded-lg">
              <span className="font-semibold">{t.amount}:</span>
              <span className="text-xl font-bold">{t.rupees}{calculation.amount}</span>
            </div>
            {calculation.remainingFineGold && calculation.remainingFineGold > 0 && (
              <div className="flex justify-between items-center p-4 bg-gold-light rounded-lg">
                <span className="font-semibold">{t.remainingFineGold}:</span>
                <span className="text-xl font-bold">{calculation.remainingFineGold} {t.grams}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="success"
              size="lg"
              onClick={handleConfirm}
              className="flex-1 h-16 text-lg"
            >
              <Check size={24} className="mr-2" />
              {t.confirm}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => navigate('/')}
              className="flex-1 h-16 text-lg"
            >
              <X size={24} className="mr-2" />
              {t.cancel}
            </Button>
          </div>
        </div>
      );
    }

    if (currentStepName === 'cash' && currentSteps.includes('cash')) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-6">{t.partialCash}</h3>
          </div>
          <div className="flex gap-4">
            <Button
              variant="gold"
              size="lg"
              onClick={() => handleCashDecision(true)}
              className="flex-1 h-16 text-lg"
            >
              {t.yes}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleCashDecision(false)}
              className="flex-1 h-16 text-lg"
            >
              {t.no}
            </Button>
          </div>
        </div>
      );
    }

    const stepLabels = {
      weight: t.weight,
      purity: t.purity,
      reduction: t.reduction,
      rate: t.rate,
      cashPaid: t.cashPaid
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-primary mb-4">
            {values[currentStepName as keyof typeof values] || '0'}
          </div>
          <p className="text-lg text-muted-foreground">{t.enterValue}</p>
        </div>
        
        <NumericKeypad
          value={values[currentStepName as keyof typeof values] as string}
          onChange={handleValueChange}
          allowDecimal={currentStepName !== 'purity' && currentStepName !== 'reduction'}
        />
      </div>
    );
  };

  if (!transactionType || !steps[transactionType]) {
    navigate('/');
    return null;
  }

  const stepLabels = {
    weight: t.weight,
    purity: t.purity,
    reduction: t.reduction,
    rate: t.rate,
    cash: t.partialCash,
    cashPaid: t.cashPaid,
    summary: t.summary
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gold-light">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
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

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t[transactionType.toLowerCase() as keyof typeof t]}
            </CardTitle>
            <div className="flex justify-center items-center gap-2 mt-4">
              {currentSteps.map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stepLabels[currentStepName as keyof typeof stepLabels]}
            </p>
          </CardHeader>
          
          <CardContent>
            {renderStepContent()}
            
            {currentStepName !== 'summary' && currentStepName !== 'cash' && (
              <Button
                variant="gold"
                size="lg"
                onClick={handleNext}
                className="w-full mt-6 h-16 text-lg"
                disabled={!values[currentStepName as keyof typeof values]}
              >
                {t.next}
                <ArrowRight size={20} className="ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}