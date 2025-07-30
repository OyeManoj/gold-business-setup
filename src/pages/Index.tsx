import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TransactionButton } from '@/components/TransactionButton';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { ArrowUpDown, ShoppingCart, DollarSign, History } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-gold-light/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold text-foreground">
            {t.appTitle}
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/history')}
              className="flex items-center gap-2"
            >
              <History size={16} />
              {t.history}
            </Button>
            <LanguageToggle
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>

        {/* Main Transaction Buttons */}
        <div className="max-w-md mx-auto space-y-6">
          <TransactionButton
            icon={ArrowUpDown}
            title={t.exchange}
            onClick={() => navigate('/transaction/exchange')}
          />
          <TransactionButton
            icon={ShoppingCart}
            title={t.purchase}
            onClick={() => navigate('/transaction/purchase')}
          />
          <TransactionButton
            icon={DollarSign}
            title={t.sale}
            onClick={() => navigate('/transaction/sale')}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>Ultra-minimal gold business app</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
