import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TransactionCard } from '@/components/TransactionCard';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { ArrowUpDown, ShoppingCart, DollarSign, History, Coins } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-gold-light/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center shadow-lg">
              <Coins size={24} className="text-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              {t.appTitle}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Professional gold trading made simple
          </p>
        </div>

        {/* Language and History Controls */}
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-12">
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
          <Button
            variant="outline"
            size="default"
            onClick={() => navigate('/history')}
            className="flex items-center gap-2"
          >
            <History size={16} />
            {t.history}
          </Button>
        </div>

        {/* Main Transaction Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <TransactionCard
              icon={ArrowUpDown}
              title={t.exchange}
              description="Exchange old gold for new with purity adjustments and reductions"
              onClick={() => navigate('/transaction/exchange')}
            />
            <TransactionCard
              icon={ShoppingCart}
              title={t.purchase}
              description="Buy gold from customers with precise weight and purity calculations"
              onClick={() => navigate('/transaction/purchase')}
            />
            <TransactionCard
              icon={DollarSign}
              title={t.sale}
              description="Sell gold to customers with current market rates"
              onClick={() => navigate('/transaction/sale')}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-2xl mx-auto text-center mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-gold-light rounded-full mx-auto flex items-center justify-center">
                <span className="text-xs font-bold">✓</span>
              </div>
              <p>Offline Support</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-gold-light rounded-full mx-auto flex items-center justify-center">
                <span className="text-xs font-bold">✓</span>
              </div>
              <p>Multi Language</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-gold-light rounded-full mx-auto flex items-center justify-center">
                <span className="text-xs font-bold">✓</span>
              </div>
              <p>Receipt Printing</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-gold-light rounded-full mx-auto flex items-center justify-center">
                <span className="text-xs font-bold">✓</span>
              </div>
              <p>Transaction History</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
