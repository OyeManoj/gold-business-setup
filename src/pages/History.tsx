import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { FilterSection } from '@/components/FilterSection';
import { TransactionSummaryCard } from '@/components/TransactionSummaryCard';
import { ExportControls } from '@/components/ExportControls';
import { BulkTransactionControls } from '@/components/BulkTransactionControls';
import { clearTransactions, deleteTransaction, deleteTransactions } from '@/utils/storage';
import { useTranslation } from '@/utils/translations';
import { formatTransactionType } from '@/utils/exportUtils';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { ArrowLeft, Edit, History as HistoryIcon, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianRate, formatWeight, formatPercentage } from '@/utils/indianFormatting';
import { generateReceiptText, printReceipt } from '@/utils/receipt';
import { getBusinessProfile } from '@/utils/businessStorage';
import { getReceiptSettings } from '@/utils/receiptSettingsStorage';
import { SwipeableTransactionRow } from '@/components/SwipeableTransactionRow';

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showSelection, setShowSelection] = useState(false);
  
  // Use realtime transactions hook for automatic sync across devices
  const { transactions, isLoading, refreshTransactions } = useRealtimeTransactions();
  
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
    await refreshTransactions();
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

  const handleDeleteTransaction = async (transaction: any) => {
    try {
      await deleteTransaction(transaction.id);
      await refreshTransactions();
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async (transactionIds: string[]) => {
    try {
      await deleteTransactions(transactionIds);
      await refreshTransactions();
      setSelectedTransactions([]);
      toast({
        title: "Success",
        description: `${transactionIds.length} transaction${transactionIds.length > 1 ? 's' : ''} deleted successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete some transactions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectionChange = (transactionIds: string[]) => {
    setSelectedTransactions(transactionIds);
  };

  const handleSingleSelectionChange = (transactionId: string, selected: boolean) => {
    if (selected) {
      setSelectedTransactions(prev => [...prev, transactionId]);
    } else {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
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

        {/* Clean Main Content */}
        <Card className="max-w-7xl mx-auto border border-border bg-white rounded-md">
          <CardHeader className="bg-white border-b border-border px-3 py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">{t.history}</CardTitle>
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
              <div className="mt-2 p-2 bg-muted rounded border border-border">
                <FilterSection
                  filters={filters}
                  onFilterChange={updateFilter}
                />
              </div>
            )}
          </CardHeader>
          
          <CardContent className="px-3 py-2">
            {/* Summary Section */}
            <div className="mb-3">
              <div className="bg-muted rounded p-2 border border-border">
                <TransactionSummaryCard summary={summary} />
              </div>
            </div>
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-6">
                <div className="max-w-md mx-auto">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <HistoryIcon size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {transactions.length === 0 ? 'No transactions yet' : 'No transactions match filters'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Bulk Transaction Controls */}
                <BulkTransactionControls
                  transactions={filteredTransactions}
                  selectedTransactions={selectedTransactions}
                  onSelectionChange={handleSelectionChange}
                  onBulkDelete={handleBulkDelete}
                  showSelection={showSelection}
                  setShowSelection={setShowSelection}
                />

                {/* Clean Transaction Table */}
                <div className="bg-white rounded border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          {showSelection && (
                            <th className="text-left py-1 px-2 w-8"></th>
                          )}
                          <th className="text-left py-1 px-2 font-medium text-foreground text-xs">Date</th>
                          <th className="text-left py-1 px-2 font-medium text-foreground text-xs">Type</th>
                          <th className="text-right py-1 px-2 font-medium text-foreground text-xs">Weight</th>
                          <th className="text-right py-1 px-2 font-medium text-foreground text-xs">Purity</th>
                          <th className="text-right py-1 px-2 font-medium text-foreground text-xs">Rate</th>
                          <th className="text-right py-1 px-2 font-medium text-foreground text-xs">Fine Gold</th>
                          <th className="text-right py-1 px-2 font-medium text-foreground text-xs">Amount</th>
                          <th className="text-center py-1 px-2 font-medium text-foreground text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction, index) => (
                          <SwipeableTransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            index={index}
                            language={language}
                            showSelection={showSelection}
                            isSelected={selectedTransactions.includes(transaction.id)}
                            onSelectionChange={handleSingleSelectionChange}
                            onEdit={handleEditTransaction}
                            onPrint={handlePrintReceipt}
                            onDelete={handleDeleteTransaction}
                          />
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