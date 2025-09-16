import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTitle } from '@/hooks/useAppTitle';
import { History, Settings, LogOut, User } from 'lucide-react';
import { DeviceTracker } from '@/components/DeviceTracker';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, hasPermission } = useAuth();
  const { appTitle } = useAppTitle();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);

  // Update document title when appTitle changes
  useEffect(() => {
    document.title = `${appTitle} - Business Management`;
  }, [appTitle]);


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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-2 sm:px-3 py-2 sm:py-3">
        {/* Clean Minimal Header */}
        <div className="text-center mb-4 sm:mb-6">
           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2 tracking-tight">
             {language === 'ar' ? (appTitle === 'Gold Ease' ? 'ذهب أمبيكا' : appTitle) : appTitle}
           </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            {language === 'ar' ? 'نظام إدارة المعاملات' : 'Transaction Management'}
          </p>
        </div>

        {/* Minimal Navigation */}
        <div className="w-full mb-3 sm:mb-4">
          <div className="bg-white border border-border p-2 sm:p-3 rounded-md">            
            <div className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/business-profile')}
                  className="flex items-center gap-1 text-xs"
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">{language === 'ar' ? 'Business' : 'Business'}</span>
                </Button>
                
                {hasPermission('history') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-1 text-xs"
                  >
                    <History size={14} />
                    <span>{t.history}</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <DeviceTracker />
                
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                  <User size={12} />
                  <span className="font-medium truncate max-w-16 sm:max-w-none">{user?.name || 'User'}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-1 text-xs"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">{language === 'ar' ? 'Logout' : 'Logout'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Transaction Cards */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {transactions.map((transaction, index) => (
              <Card 
                key={transaction.type}
                className="bg-white border border-border hover:border-primary cursor-pointer transition-all duration-150 hover:shadow-sm active:scale-[0.99]"
                onClick={() => navigate(transaction.path)}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 tracking-tight">
                    {transaction.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                    {transaction.description}
                  </p>

                  <div className="border-t border-border pt-3">
                    <span className="text-primary font-medium text-xs tracking-wide">
                      {language === 'ar' ? 'ابدأ الآن' : 'START NOW'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts onQuickTransaction={(type) => navigate(`/transaction/${type}`)} />
    </div>
  );
};

export default Index;