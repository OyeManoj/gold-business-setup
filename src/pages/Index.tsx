import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowUpDown, ShoppingCart, TrendingUp, History, Settings, LogOut } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);
  const { signOut, user } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-off-white to-background">
      <div className="container mx-auto px-6 py-16">
        {/* Header with perfect symmetry */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-dark mb-6 drop-shadow-sm tracking-tight">
            {t.appTitle}
          </h1>
          <div className="flex justify-center">
            <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-dark to-transparent rounded-full shadow-sm"></div>
          </div>
        </div>

        {/* User Info and Navigation Controls with perfect alignment */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/50">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground font-medium">
                {language === 'ar' ? 'مسجل الدخول كـ:' : 'Signed in as:'} 
                <span className="text-foreground font-semibold ml-1">{user?.email}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => navigate('/business-profile')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 hover:border-dark/20 hover:shadow-md transition-all duration-200 bg-white/80"
                >
                  <Settings size={18} />
                  <span className="font-medium">{language === 'ar' ? 'ملف العمل' : 'Business Profile'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 hover:border-dark/20 hover:shadow-md transition-all duration-200 bg-white/80"
                >
                  <History size={18} />
                  <span className="font-medium">{t.history}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="default"
                  onClick={signOut}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-destructive/20 text-destructive hover:text-destructive hover:border-destructive/30 hover:shadow-md transition-all duration-200 bg-white/80"
                >
                  <LogOut size={18} />
                  <span className="font-medium">{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Grid with enhanced symmetry */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transactions.map((transaction, index) => {
              const Icon = transaction.icon;
              const colors = [
                { bg: 'bg-accent-1', text: 'text-accent-1', accent: 'accent-1', hover: 'hover:bg-accent-1/5', shadow: 'shadow-lg' },
                { bg: 'bg-accent-2', text: 'text-accent-2', accent: 'accent-2', hover: 'hover:bg-accent-2/5', shadow: 'shadow-lg' },
                { bg: 'bg-accent-3', text: 'text-accent-3', accent: 'accent-3', hover: 'hover:bg-accent-3/5', shadow: 'shadow-xl' }
              ];
              const colorScheme = colors[index];
              
              return (
                <Card
                  key={transaction.type}
                  className={`group cursor-pointer border-2 border-border/60 bg-white/90 hover:bg-white hover:shadow-2xl transition-all duration-300 hover:border-${colorScheme.accent}/30 ${colorScheme.hover} hover:-translate-y-2 hover:scale-[1.02] rounded-2xl backdrop-blur-sm`}
                  onClick={() => navigate(transaction.path)}
                >
                  <CardContent className="p-10 text-center">
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-${colorScheme.accent}/10 border-2 border-${colorScheme.accent}/20 flex items-center justify-center group-hover:bg-${colorScheme.accent}/20 group-hover:scale-110 group-hover:border-${colorScheme.accent}/40 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                      <Icon size={32} className={`${colorScheme.text} group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-4 text-foreground group-hover:${colorScheme.text} transition-colors duration-300 tracking-tight`}>
                      {transaction.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300 max-w-xs mx-auto">
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