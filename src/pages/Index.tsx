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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-foreground mb-4">
            {t.appTitle}
          </h1>
          <div className="w-12 h-px bg-gold/40 mx-auto"></div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mb-12">
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
            {transactions.map((transaction, index) => {
              const Icon = transaction.icon;
              const colors = [
                { bg: 'bg-gold', text: 'text-gold', accent: 'bg-gold-light', hover: 'hover:bg-gold/10' },
                { bg: 'bg-coral', text: 'text-coral', accent: 'bg-coral-light', hover: 'hover:bg-coral/10' },
                { bg: 'bg-mint', text: 'text-mint', accent: 'bg-mint-light', hover: 'hover:bg-mint/10' }
              ];
              const colorScheme = colors[index];
              
              return (
                <Card
                  key={transaction.type}
                  className={`group cursor-pointer border-0 bg-white hover:shadow-lg transition-all duration-300 shadow-sm ${colorScheme.hover}`}
                  onClick={() => navigate(transaction.path)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-18 h-18 mx-auto mb-6 rounded-2xl ${colorScheme.accent}/60 flex items-center justify-center group-hover:${colorScheme.accent}/80 group-hover:scale-105 transition-all duration-300`}>
                      <Icon size={24} className={`${colorScheme.text} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <h3 className={`text-base font-semibold mb-3 text-foreground group-hover:${colorScheme.text} transition-colors duration-300`}>
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