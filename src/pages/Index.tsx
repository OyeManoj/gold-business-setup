import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { ArrowUpDown, ShoppingCart, TrendingUp, History } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);

  const transactions = [
    {
      type: 'exchange',
      icon: ArrowUpDown,
      title: t.exchange,
      description: 'Exchange gold with reduction calculations',
      path: '/transaction/exchange'
    },
    {
      type: 'purchase',
      icon: ShoppingCart,
      title: t.purchase,
      description: 'Purchase gold with purity assessment',
      path: '/transaction/purchase'
    },
    {
      type: 'sale',
      icon: TrendingUp,
      title: t.sale,
      description: 'Sell gold at current market rates',
      path: '/transaction/sale'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-light text-foreground mb-4">
            {t.appTitle}
          </h1>
          <div className="w-12 h-px bg-border mx-auto"></div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mb-16">
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/history')}
            className="flex items-center gap-2"
          >
            <History size={16} />
            {t.history}
          </Button>
        </div>

        {/* Transaction Grid */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <Card
                  key={transaction.type}
                  className="group cursor-pointer border-2 hover:border-primary/20 transition-all duration-300"
                  onClick={() => navigate(transaction.path)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                      <Icon size={28} className="text-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{transaction.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {transaction.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;