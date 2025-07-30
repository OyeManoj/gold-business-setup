import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { getTransactions, clearTransactions } from '@/utils/storage';
import { useTranslation } from '@/utils/translations';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [transactions, setTransactions] = useState(getTransactions());
  
  const t = useTranslation(language);

  const handleClearHistory = () => {
    clearTransactions();
    setTransactions([]);
    toast({
      title: "Success",
      description: "Transaction history cleared",
      variant: "default"
    });
  };

  const formatTransactionType = (type: string) => {
    return t[type.toLowerCase() as keyof typeof t] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
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

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-medium">{t.history}</CardTitle>
              {transactions.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearHistory}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 border rounded-xl bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-lg">
                        {formatTransactionType(transaction.type)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {transaction.date.toLocaleDateString()} {transaction.date.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t.weight}: </span>
                        <span className="font-medium">{transaction.weight} {t.grams}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.fineGold}: </span>
                        <span className="font-medium">{transaction.fineGold} {t.grams}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.rate}: </span>
                        <span className="font-medium">{t.rupees}{transaction.rate}/{t.grams}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.amount}: </span>
                        <span className="font-bold text-lg text-primary">
                          {t.rupees}{transaction.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}