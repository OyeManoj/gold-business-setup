import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowUpDown, ShoppingCart, TrendingUp, History, Settings, LogOut, User } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
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
      description: 'Sell gold with market rate calculations',
      path: '/transaction/sale'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-primary opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-secondary opacity-40 animate-gradient-shift"></div>
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-card rounded-full opacity-20 animate-glow"></div>
      <div className="absolute top-60 right-20 w-48 h-48 bg-gradient-button rounded-lg rotate-45 opacity-15"></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-primary rounded-full opacity-25"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Modern Header with Gradient Text */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pure-white via-off-white to-gray-light bg-clip-text text-transparent mb-6 tracking-tight">
            {language === 'ar' ? 'سهولة الذهب' : 'Gold Ease'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            {language === 'ar' ? 'نظام إدارة المعاملات المتقدم' : 'Advanced Transaction Management System'}
          </p>
          <div className="w-24 h-1 bg-gradient-button mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Compact Navigation with Glass Effect */}
        <div className="max-w-5xl mx-auto mb-12 animate-scale-in">
          <div className="bg-card/10 backdrop-blur-xl rounded-2xl p-6 shadow-elegant border border-border/20">            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <LanguageToggle
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/business-profile')}
                    className="flex items-center gap-2 bg-primary/10 border-primary/30 hover:bg-primary/20 transition-all duration-300"
                  >
                    <Settings size={16} />
                    <span className="font-medium text-sm">{language === 'ar' ? 'ملف العمل' : 'Business Profile'}</span>
                  </Button>
                  
                  {hasPermission('history') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/history')}
                      className="flex items-center gap-2 bg-accent-1/10 border-accent-1/30 hover:bg-accent-1/20 transition-all duration-300"
                    >
                      <History size={16} />
                      <span className="font-medium text-sm">{t.history}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* User Menu with Enhanced Styling */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-card rounded-xl shadow-soft border border-border/30">
                  <User size={18} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">ID: {user?.userId} • {user?.role?.toUpperCase()}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 transition-all duration-300"
                >
                  <LogOut size={16} />
                  <span className="font-medium text-sm">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Transaction Cards with Enhanced Design */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transactions.map((transaction, index) => (
              <Card 
                key={transaction.type}
                className="group relative overflow-hidden bg-gradient-card backdrop-blur-xl border border-border/30 hover:border-primary/40 cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:shadow-strong animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => navigate(transaction.path)}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                
                <CardContent className="relative p-10">
                  <div className="text-center">
                    {/* Enhanced Icon Container */}
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-button rounded-3xl mb-8 group-hover:scale-110 transition-all duration-500 shadow-dark group-hover:shadow-strong">
                      <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <transaction.icon className="relative w-10 h-10 text-primary-foreground z-10" />
                    </div>
                    
                    {/* Enhanced Typography */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                      {transaction.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                      {transaction.description}
                    </p>

                    {/* Action Indicator */}
                    <div className="inline-flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span>{language === 'ar' ? 'ابدأ الآن' : 'Start Now'}</span>
                      <ArrowUpDown size={14} className="ml-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="text-center mt-16 opacity-60">
          <div className="w-32 h-0.5 bg-gradient-border mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;