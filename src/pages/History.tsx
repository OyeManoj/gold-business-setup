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
import { ArrowLeft, Edit } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t.back}
          </Button>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-medium">{t.history}</CardTitle>
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
              <FilterSection
                filters={filters}
                onFilterChange={updateFilter}
              />
            )}
          </CardHeader>
          
          <CardContent>
            {/* Summary below filter option */}
            {filteredTransactions.length > 0 && (
              <div className="mb-6">
                <TransactionSummaryCard summary={summary} />
              </div>
            )}
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {transactions.length === 0 ? 'No transactions yet' : 'No transactions match the selected filters'}
                </p>
              </div>
            ) : (
              <>
                {/* Transaction Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-2 font-semibold text-foreground">Date & Time</th>
                        <th className="text-left py-3 px-2 font-semibold text-foreground">Type</th>
                        <th className="text-right py-3 px-2 font-semibold text-foreground">Weight (g)</th>
                        <th className="text-right py-3 px-2 font-semibold text-foreground">Purity (%)</th>
                        <th className="text-right py-3 px-2 font-semibold text-foreground">Rate (₹/g)</th>
                        <th className="text-right py-3 px-2 font-semibold text-foreground">Fine Gold (g)</th>
                        <th className="text-right py-3 px-2 font-semibold text-foreground">Amount (₹)</th>
                        <th className="text-center py-3 px-2 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction, index) => (
                        <tr 
                          key={transaction.id}
                          className={`border-b border-border hover:bg-muted/30 transition-colors ${
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                          }`}
                        >
                          <td className="py-4 px-2">
                            <div className="text-sm">
                              <div className="font-medium">{transaction.date.toLocaleDateString('en-IN')}</div>
                              <div className="text-muted-foreground text-xs">{transaction.date.toLocaleTimeString('en-IN', { hour12: true })}</div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                              transaction.type === 'PURCHASE' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : transaction.type === 'SALE'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {formatTransactionType(transaction.type, language)}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right font-mono text-sm">{formatWeight(transaction.weight)}</td>
                          <td className="py-4 px-2 text-right font-mono text-sm">{formatPercentage(transaction.purity)}</td>
                          <td className="py-4 px-2 text-right font-mono text-sm">{formatIndianRate(transaction.rate).replace('₹', '').replace('/g', '')}</td>
                          <td className="py-4 px-2 text-right font-mono text-sm font-medium">{formatWeight(transaction.fineGold)}</td>
                          <td className="py-4 px-2 text-right font-mono text-sm font-bold">{formatIndianCurrency(transaction.amount)}</td>
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}