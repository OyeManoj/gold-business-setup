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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-extralight text-foreground mb-6 tracking-wide">
            {t.appTitle}
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-8 mb-20">
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          >
            <History size={16} />
            {t.history}
          </Button>
        </div>

        {/* Transaction Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <Card
                  key={transaction.type}
                  className="group cursor-pointer border-0 shadow-elegant hover:shadow-lg transform hover:-translate-y-2 bg-gradient-to-br from-card via-card to-muted/50 backdrop-blur-sm transition-all duration-500"
                  onClick={() => navigate(transaction.path)}
                >
                  <CardContent className="p-10 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-500"></div>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Icon size={32} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                      {transaction.title}
                    </h3>
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