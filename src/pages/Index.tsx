import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { useAuth } from '@/contexts/AuthContext';
import { History, Settings, LogOut, User } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);


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
      
      <div className="relative z-10 container mx-auto px-8 py-12">
        {/* Sharp Modern Header */}
        <div className="text-center mb-8">
          <h1 className="text-7xl md:text-8xl font-extrabold text-foreground mb-4 tracking-tighter">
            {language === 'ar' ? 'ذهب أمبيكا' : 'AMBIKA GOLD'}
          </h1>
          <p className="text-xl text-muted-foreground font-normal max-w-2xl mx-auto">
            {language === 'ar' ? 'نظام إدارة المعاملات المتقدم' : 'Advanced Transaction Management System'}
          </p>
          <div className="w-32 h-1 bg-primary mx-auto mt-4"></div>
        </div>

        {/* Sharp Navigation Bar */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-card border border-border shadow-md p-6">            
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <LanguageToggle
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/business-profile')}
                    className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Settings size={16} />
                    <span className="font-medium">{language === 'ar' ? 'ملف العمل' : 'Business Profile'}</span>
                  </Button>
                  
                  {hasPermission('history') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/history')}
                      className="flex items-center gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      <History size={16} />
                      <span className="font-medium">{t.history}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-muted border border-border">
                  <User size={20} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{user?.name}</span>
                    <span className="text-sm text-muted-foreground">ID: {user?.userId} • {user?.role?.toUpperCase()}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut size={16} />
                  <span className="font-medium">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sharp Transaction Cards Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transactions.map((transaction, index) => (
              <Card 
                key={transaction.type}
                className="group bg-card border-2 border-border hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => navigate(transaction.path)}
              >
                <CardContent className="p-12 text-center">
                  {/* Sharp Typography */}
                  <h3 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-wide">
                    {transaction.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                    {transaction.description}
                  </p>

                  {/* Action Button */}
                  <div className="border-t border-border pt-6">
                    <span className="text-primary font-semibold uppercase tracking-wider text-sm">
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