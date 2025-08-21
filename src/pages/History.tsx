import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { FilterSection } from '@/components/FilterSection';
import { TransactionSummaryCard } from '@/components/TransactionSummaryCard';
import { ExportControls } from '@/components/ExportControls';
import { getTransactions, clearTransactions } from '@/utils/storage';
import { useTranslation } from '@/utils/translations';
import { formatTransactionType } from '@/utils/exportUtils';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { ArrowLeft, Edit, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianRate, formatWeight, formatPercentage } from '@/utils/indianFormatting';

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    const loadTransactions = async () => {
      const loadedTransactions = await getTransactions();
      setTransactions(loadedTransactions);
    };
    loadTransactions();
  }, []);
  
  const {
    filters,
    filteredTransactions,
    summary,
    showFilters,
    setShowFilters,
    updateFilter
  } = useTransactionFilters(transactions);
  
  const t = useTranslation(language);

  const handleClearHistory = async () => {
    await clearTransactions();
    setTransactions([]);
    toast({
      title: "Success",
      description: "Transaction history cleared",
      variant: "default"
    });
  };

  const handleEditTransaction = (transaction: any) => {
    navigate(`/transaction/${transaction.type.toLowerCase()}/edit/${transaction.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-off-white to-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header with perfect alignment */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="default"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium text-lg">{t.back}</span>
            </Button>
          </div>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Main Content Card with enhanced design */}
        <Card className="max-w-7xl mx-auto shadow-xl border-2 border-border/60 bg-white/95 backdrop-blur-sm rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-white/80 to-off-white/80 rounded-t-2xl border-b-2 border-border/30 px-8 py-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-dark tracking-tight">{t.history}</CardTitle>
              <ExportControls
                transactions={transactions}
                filteredTransactions={filteredTransactions}
                summary={summary}
                filters={filters}
                showFilters={showFilters}
                language={language}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearHistory={handleClearHistory}
              />
            </div>
            
            {showFilters && (
              <div className="mt-8 p-6 bg-white/60 rounded-xl border border-border/40 shadow-inner">
                <FilterSection
                  filters={filters}
                  onFilterChange={updateFilter}
                />
              </div>
            )}
          </CardHeader>
          
          <CardContent className="px-8 py-8">
            {/* Enhanced Summary Section */}
            {filteredTransactions.length > 0 && (
              <div className="mb-10">
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-border/50 shadow-inner">
                  <TransactionSummaryCard summary={summary} />
                </div>
              </div>
            )}
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HistoryIcon size={40} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-xl font-medium">
                    {transactions.length === 0 ? 'No transactions yet' : 'No transactions match the selected filters'}
                  </p>
                  <p className="text-muted-foreground/70 text-sm mt-2">
                    {transactions.length === 0 ? 'Start by creating your first transaction' : 'Try adjusting your filter criteria'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Transaction Table */}
                <div className="bg-white rounded-xl border-2 border-border/40 shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-2 border-border/50">
                          <th className="text-left py-5 px-4 font-bold text-foreground text-sm tracking-wide">Date & Time</th>
                          <th className="text-left py-5 px-4 font-bold text-foreground text-sm tracking-wide">Type</th>
                          <th className="text-right py-5 px-4 font-bold text-foreground text-sm tracking-wide">Weight (g)</th>
                          <th className="text-right py-5 px-4 font-bold text-foreground text-sm tracking-wide">Purity (%)</th>
                          <th className="text-right py-5 px-4 font-bold text-foreground text-sm tracking-wide">Rate (₹/g)</th>
                          <th className="text-right py-5 px-4 font-bold text-foreground text-sm tracking-wide">Fine Gold (g)</th>
                          <th className="text-right py-5 px-4 font-bold text-foreground text-sm tracking-wide">Amount (₹)</th>
                          <th className="text-center py-5 px-4 font-bold text-foreground text-sm tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction, index) => (
                          <tr 
                            key={transaction.id}
                            className={`border-b border-border/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-muted/10'
                            }`}
                          >
                            <td className="py-5 px-4">
                              <div className="text-sm">
                                <div className="font-semibold text-foreground">{transaction.date.toLocaleDateString('en-IN')}</div>
                                <div className="text-muted-foreground text-xs font-medium">{transaction.date.toLocaleTimeString('en-IN', { hour12: true })}</div>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                                transaction.type === 'PURCHASE' 
                                  ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400' 
                                  : transaction.type === 'SALE'
                                  ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {formatTransactionType(transaction.type, language)}
                              </span>
                            </td>
                            <td className="py-5 px-4 text-right font-mono text-sm font-medium">{formatWeight(transaction.weight)}</td>
                            <td className="py-5 px-4 text-right font-mono text-sm font-medium">{formatPercentage(transaction.purity)}</td>
                            <td className="py-5 px-4 text-right font-mono text-sm font-medium">{formatIndianRate(transaction.rate).replace('₹', '').replace('/g', '')}</td>
                            <td className="py-5 px-4 text-right font-mono text-sm font-semibold text-primary">{formatWeight(transaction.fineGold)}</td>
                            <td className="py-5 px-4 text-right font-mono text-sm font-bold text-green-700 dark:text-green-400">{formatIndianCurrency(transaction.amount)}</td>
                            <td className="py-5 px-4 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                                className="h-9 w-9 p-0 rounded-lg border-2 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md transition-all duration-200"
                              >
                                <Edit size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}