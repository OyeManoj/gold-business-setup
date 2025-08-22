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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Welcome to Ambika Gold
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Choose a transaction type to get started
        </p>
        <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
      </div>

      {/* Transaction Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {transactions.map((transaction, index) => (
          <Card 
            key={transaction.type}
            className="group bg-card border-2 border-border hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation"
            onClick={() => navigate(transaction.path)}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 uppercase tracking-wide">
                {transaction.title}
              </h3>
              
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                {transaction.description}
              </p>

              <div className="border-t border-border pt-4">
                <span className="text-primary font-semibold uppercase tracking-wider text-xs sm:text-sm">
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