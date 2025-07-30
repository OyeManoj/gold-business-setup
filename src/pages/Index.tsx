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
          <h1 className="text-4xl font-bold text-gold mb-4 drop-shadow-sm">
            {t.appTitle}
          </h1>
          <div className="w-16 h-1 bg-gold/80 mx-auto rounded-full shadow-sm"></div>
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
                { bg: 'bg-gold', text: 'text-gold', accent: 'bg-gold', hover: 'hover:bg-gold/5', shadow: 'shadow-gold' },
                { bg: 'bg-coral', text: 'text-coral', accent: 'bg-coral', hover: 'hover:bg-coral/5', shadow: 'shadow-coral' },
                { bg: 'bg-emerald', text: 'text-emerald', accent: 'bg-emerald', hover: 'hover:bg-emerald/5', shadow: 'shadow-mint' }
              ];
              const colorScheme = colors[index];
              
              return (
                <Card
                  key={transaction.type}
                  className={`group cursor-pointer border-2 border-white bg-white hover:shadow-xl transition-all duration-300 shadow-lg hover:border-${colorScheme.accent}/20 ${colorScheme.hover} hover:-translate-y-1`}
                  onClick={() => navigate(transaction.path)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl ${colorScheme.accent}/10 border-2 border-${colorScheme.accent}/20 flex items-center justify-center group-hover:${colorScheme.accent}/20 group-hover:scale-110 group-hover:border-${colorScheme.accent}/40 transition-all duration-300 shadow-md`}>
                      <Icon size={28} className={`${colorScheme.text} group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`} />
                    </div>
                    <h3 className={`text-lg font-bold mb-3 text-foreground group-hover:${colorScheme.text} transition-colors duration-300`}>
                      {transaction.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
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