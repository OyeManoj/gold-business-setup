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

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, hasPermission } = useAuth();
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
    <div className="min-h-screen bg-background">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Mobile-first Modern Header */}
        <div className="text-center mb-6 sm:mb-8">
           <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-foreground mb-2 sm:mb-4 tracking-tighter leading-tight">
             {language === 'ar' ? (appTitle === 'Gold Ease' ? 'ذهب أمبيكا' : appTitle) : appTitle.toUpperCase()}
           </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-normal max-w-2xl mx-auto px-2">
            {language === 'ar' ? 'نظام إدارة المعاملات المتقدم' : 'Advanced Transaction Management System'}
          </p>
          <div className="w-16 sm:w-24 md:w-32 h-1 bg-primary mx-auto mt-2 sm:mt-4"></div>
        </div>

        {/* Single Row Navigation */}
        <div className="w-full mb-6 sm:mb-8 md:mb-12">
          <div className="bg-card border border-border shadow-md p-3 sm:p-4 rounded-lg">            
            <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/business-profile')}
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm whitespace-nowrap"
                >
                  <Settings size={16} />
                  <span className="font-medium hidden sm:inline">{language === 'ar' ? 'ملف العمل' : 'Business Profile'}</span>
                  <span className="font-medium sm:hidden">{language === 'ar' ? 'الملف' : 'Profile'}</span>
                </Button>
                
                {hasPermission('history') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm whitespace-nowrap"
                  >
                    <History size={16} />
                    <span className="font-medium">{t.history}</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <DeviceTracker />
                
                <div className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg">
                  <User size={16} className="text-primary" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground text-sm truncate">{profile?.name || user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {profile?.role?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-sm whitespace-nowrap"
                >
                  <LogOut size={16} />
                  <span className="font-medium hidden sm:inline">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                  <span className="font-medium sm:hidden">{language === 'ar' ? 'خروج' : 'Out'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-first Transaction Cards Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {transactions.map((transaction, index) => (
              <Card 
                key={transaction.type}
                className="group bg-card border-2 border-border hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation"
                onClick={() => navigate(transaction.path)}
              >
                <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 text-center">
                  {/* Mobile-optimized Typography */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 uppercase tracking-wide leading-tight">
                    {transaction.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                    {transaction.description}
                  </p>

                  {/* Action Button */}
                  <div className="border-t border-border pt-4 sm:pt-6">
                    <span className="text-primary font-semibold uppercase tracking-wider text-xs sm:text-sm">
                      {language === 'ar' ? 'ابدأ الآن' : 'START NOW'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Grid Accent */}
        <div className="text-center mt-24">
          <div className="w-48 h-1 bg-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;