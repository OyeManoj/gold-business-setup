import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);


  const transactions = [
    {
      type: 'exchange',
      title: t.exchange,
      description: 'Exchange gold with reduction calculations',
      path: '/transaction/exchange'
    },
    {
      type: 'purchase',
      title: t.purchase,
      description: 'Purchase gold with purity assessment',
      path: '/transaction/purchase'
    },
    {
      type: 'sale',
      title: t.sale,
      description: 'Sell gold with market rate calculations',
      path: '/transaction/sale'
    }
  ];

  return (
    <div className="p-2 sm:p-4">
      {/* Welcome Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Welcome to Ambika Gold
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Choose a transaction type to get started
        </p>
        <div className="w-16 h-0.5 bg-primary mx-auto mt-2"></div>
      </div>

      {/* Transaction Cards in Single Line */}
      <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto overflow-x-auto">
        {transactions.map((transaction, index) => (
          <Card 
            key={transaction.type}
            className="group bg-card border border-border hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation flex-shrink-0 min-w-[160px] sm:min-w-[200px]"
            onClick={() => navigate(transaction.path)}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-1 uppercase tracking-wide">
                {transaction.title}
              </h3>
              
              <p className="text-muted-foreground mb-2 text-xs hidden sm:block">
                {transaction.description}
              </p>

              <div className="border-t border-border pt-2">
                <span className="text-primary font-semibold uppercase tracking-wider text-xs">
                  {language === 'ar' ? 'ابدأ الآن' : 'START NOW'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;