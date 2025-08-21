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
import { ArrowLeft, Edit, History as HistoryIcon, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianRate, formatWeight, formatPercentage } from '@/utils/indianFormatting';
import { generateReceiptText, printReceipt } from '@/utils/receipt';
import { getBusinessProfile } from '@/utils/businessStorage';
import { getReceiptSettings } from '@/utils/receiptSettingsStorage';

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

  const handlePrintReceipt = async (transaction: any) => {
    try {
      const businessProfile = await getBusinessProfile();
      const receiptSettings = await getReceiptSettings();
      const receiptText = generateReceiptText(transaction, language, businessProfile, receiptSettings);
      printReceipt(receiptText);
      
      toast({
        title: "Receipt Printing",
        description: "Receipt sent to printer. If nothing happened, check if popups are blocked in your browser.",
        variant: "default"
      });
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error", 
        description: "Failed to print receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-off-white to-background">
      <div className="container mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/80 hover:shadow-sm transition-all duration-200"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">{t.back}</span>
            </Button>
          </div>
          
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Compact Main Content Card */}
        <Card className="max-w-7xl mx-auto shadow-lg border border-border/60 bg-white/95 backdrop-blur-sm rounded-xl">
          <CardHeader className="bg-gradient-to-r from-white/80 to-off-white/80 rounded-t-xl border-b border-border/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-dark tracking-tight">{t.history}</CardTitle>
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
              <div className="mt-4 p-4 bg-white/60 rounded-lg border border-border/40 shadow-inner">
                <FilterSection
                  filters={filters}
                  onFilterChange={updateFilter}
                />
              </div>
            )}
          </CardHeader>
          
          <CardContent className="px-6 py-4">
            {/* Compact Summary Section */}
            {filteredTransactions.length > 0 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-border/50 shadow-inner">
                  <TransactionSummaryCard summary={summary} />
                </div>
              </div>
            )}
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HistoryIcon size={32} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-lg font-medium">
                    {transactions.length === 0 ? 'No transactions yet' : 'No transactions match the selected filters'}
                  </p>
                  <p className="text-muted-foreground/70 text-sm mt-1">
                    {transactions.length === 0 ? 'Start by creating your first transaction' : 'Try adjusting your filter criteria'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Compact Transaction Table */}
                <div className="bg-white rounded-lg border border-border/40 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
                          <th className="text-left py-3 px-3 font-bold text-foreground text-xs tracking-wide">Date & Time</th>
                          <th className="text-left py-3 px-3 font-bold text-foreground text-xs tracking-wide">Type</th>
                          <th className="text-right py-3 px-3 font-bold text-foreground text-xs tracking-wide">Weight (g)</th>
                          <th className="text-right py-3 px-3 font-bold text-foreground text-xs tracking-wide">Purity (%)</th>
                          <th className="text-right py-3 px-3 font-bold text-foreground text-xs tracking-wide">Rate (₹/g)</th>
                          <th className="text-right py-3 px-3 font-bold text-foreground text-xs tracking-wide">Fine Gold (g)</th>
                          <th className="text-right py-3 px-3 font-bold text-foreground text-xs tracking-wide">Amount (₹)</th>
                          <th className="text-center py-3 px-3 font-bold text-foreground text-xs tracking-wide">Actions</th>
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
                            <td className="py-3 px-3">
                              <div className="text-xs">
                                <div className="font-semibold text-foreground">{transaction.date.toLocaleDateString('en-IN')}</div>
                                <div className="text-muted-foreground text-xs font-medium">{transaction.date.toLocaleTimeString('en-IN', { hour12: true })}</div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold shadow-sm ${
                                transaction.type === 'PURCHASE' 
                                  ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400' 
                                  : transaction.type === 'SALE'
                                  ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {formatTransactionType(transaction.type, language)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs font-medium">{formatWeight(transaction.weight)}</td>
                            <td className="py-3 px-3 text-right font-mono text-xs font-medium">{formatPercentage(transaction.purity)}</td>
                            <td className="py-3 px-3 text-right font-mono text-xs font-medium">{formatIndianRate(transaction.rate).replace('₹', '').replace('/g', '')}</td>
                            <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-primary">{formatWeight(transaction.fineGold)}</td>
                            <td className="py-3 px-3 text-right font-mono text-xs font-bold text-green-700 dark:text-green-400">{formatIndianCurrency(transaction.amount)}</td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePrintReceipt(transaction)}
                                  className="h-7 w-7 p-0 rounded-md border hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all duration-200"
                                  title="Print Receipt"
                                >
                                  <Printer size={14} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="h-7 w-7 p-0 rounded-md border hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-200"
                                  title="Edit Transaction"
                                >
                                  <Edit size={14} />
                                </Button>
                              </div>
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