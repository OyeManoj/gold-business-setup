import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useTranslation } from '@/utils/translations';
import { ArrowUpDown, ShoppingCart, TrendingUp, History, Settings } from 'lucide-react';

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
      description: 'Sell gold with market rate calculations',
      path: '/transaction/sale'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-6 shadow-xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'ar' ? 'سهولة الذهب' : 'Gold Ease Receipt'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {language === 'ar' 
              ? 'نظام إدارة معاملات الذهب المتخصص لإنشاء الفواتير والحسابات الدقيقة'
              : 'Professional gold transaction management system for accurate receipts and calculations'
            }
          </p>
        </div>

        {/* Compact Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-border/50">            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/business-profile')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-dark/20 hover:shadow-sm transition-all duration-200 bg-white/80"
                >
                  <Settings size={16} />
                  <span className="font-medium text-sm">{language === 'ar' ? 'ملف العمل' : 'Business Profile'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-dark/20 hover:shadow-sm transition-all duration-200 bg-white/80"
                >
                  <History size={16} />
                  <span className="font-medium text-sm">{t.history}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transactions.map((transaction, index) => (
              <Card 
                key={transaction.type}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-amber-200/50 hover:border-amber-300/70"
              >
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <transaction.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {transaction.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {transaction.description}
                    </p>
                    
                    <Button 
                      onClick={() => navigate(transaction.path)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      size="lg"
                    >
                      {language === 'ar' ? 'ابدأ المعاملة' : 'Start Transaction'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-gray-500 text-sm">
            {language === 'ar' 
              ? 'نظام إدارة محترف لمعاملات الذهب'
              : 'Professional Gold Transaction Management System'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;