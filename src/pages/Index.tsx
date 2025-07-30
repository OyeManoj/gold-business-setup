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
    <div className="min-h-screen bg-gradient-to-br from-purple-light/30 via-blue-light/20 to-green-light/30">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extralight text-foreground mb-6 tracking-wide bg-gradient-to-r from-purple via-blue to-green bg-clip-text text-transparent">
            {t.appTitle}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple via-blue to-green rounded-full mx-auto"></div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-8 mb-20">
          <div className="p-1 bg-gradient-to-r from-purple to-blue rounded-2xl">
            <div className="bg-background rounded-xl">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 border-purple/30 hover:border-purple/60 hover:bg-purple/10 hover:text-purple transition-all duration-300"
          >
            <History size={16} />
            {t.history}
          </Button>
        </div>

        {/* Transaction Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transactions.map((transaction, index) => {
              const Icon = transaction.icon;
              const colors = [
                { bg: 'from-blue to-cyan', shadow: 'shadow-blue', icon: 'text-blue', hover: 'hover:bg-blue/10' },
                { bg: 'from-green to-emerald-400', shadow: 'shadow-green', icon: 'text-green', hover: 'hover:bg-green/10' },
                { bg: 'from-orange to-yellow-400', shadow: 'shadow-orange', icon: 'text-orange', hover: 'hover:bg-orange/10' }
              ];
              const colorScheme = colors[index];
              
              return (
                <Card
                  key={transaction.type}
                  className={`group cursor-pointer border-0 ${colorScheme.shadow} hover:shadow-lg transform hover:-translate-y-3 bg-gradient-to-br from-card via-card to-white backdrop-blur-sm transition-all duration-500 ${colorScheme.hover}`}
                  onClick={() => navigate(transaction.path)}
                >
                  <CardContent className="p-10 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                      <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.bg} rounded-3xl opacity-20 group-hover:opacity-30 transition-all duration-500`}></div>
                      <div className={`absolute inset-2 bg-gradient-to-br ${colorScheme.bg} rounded-2xl opacity-10 group-hover:opacity-20 transition-all duration-500`}></div>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Icon size={36} className={`${colorScheme.icon} group-hover:scale-125 transition-transform duration-300`} />
                      </div>
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 text-foreground group-hover:${colorScheme.icon} transition-colors duration-300`}>
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