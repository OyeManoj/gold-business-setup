import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { getTransactions, clearTransactions } from '@/utils/storage';
import { useTranslation } from '@/utils/translations';
import { ArrowLeft, Trash2, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Transaction, TransactionType } from '@/types/transaction';

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [transactions, setTransactions] = useState(getTransactions());
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  
  const t = useTranslation(language);

  const handleClearHistory = () => {
    clearTransactions();
    setTransactions([]);
    toast({
      title: "Success",
      description: "Transaction history cleared",
      variant: "default"
    });
  };

  const formatTransactionType = (type: string) => {
    return t[type.toLowerCase() as keyof typeof t] || type;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Type filter
      if (typeFilter !== 'ALL' && transaction.type !== typeFilter) {
        return false;
      }
      
      // Date filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (transaction.date < fromDate) {
          return false;
        }
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (transaction.date > toDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [transactions, typeFilter, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const totalWeight = filteredTransactions.reduce((sum, t) => sum + t.weight, 0);
    const totalFineGold = filteredTransactions.reduce((sum, t) => sum + t.fineGold, 0);
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const typeBreakdown = filteredTransactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTransactions: filteredTransactions.length,
      totalWeight: Number(totalWeight.toFixed(3)),
      totalFineGold: Number(totalFineGold.toFixed(3)),
      totalAmount: Number(totalAmount.toFixed(2)),
      typeBreakdown
    };
  }, [filteredTransactions]);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = filteredTransactions.map(transaction => ({
      'ID': transaction.id,
      'Date': transaction.date.toLocaleDateString(),
      'Time': transaction.date.toLocaleTimeString(),
      'Type': formatTransactionType(transaction.type),
      'Weight (g)': transaction.weight,
      'Purity (%)': transaction.purity,
      'Reduction (%)': transaction.reduction || 0,
      'Rate (₹/g)': transaction.rate,
      'Fine Gold (g)': transaction.fineGold,
      'Amount (₹)': transaction.amount
    }));
    
    // Add summary rows
    const summaryData = [
      {},
      { 'ID': '=== SUMMARY ===' },
      { 'ID': 'Total Transactions', 'Date': summary.totalTransactions },
      { 'ID': 'Total Weight (g)', 'Date': summary.totalWeight },
      { 'ID': 'Total Fine Gold (g)', 'Date': summary.totalFineGold },
      { 'ID': 'Total Amount (₹)', 'Date': summary.totalAmount },
      {},
      { 'ID': '=== TYPE BREAKDOWN ===' }
    ];
    
    Object.entries(summary.typeBreakdown).forEach(([type, count]) => {
      summaryData.push({
        'ID': formatTransactionType(type),
        'Date': count
      });
    });
    
    const allData = [...excelData, ...summaryData];
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(allData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Generate filename with date range
    const fromStr = dateFrom ? new Date(dateFrom).toLocaleDateString() : 'all';
    const toStr = dateTo ? new Date(dateTo).toLocaleDateString() : 'all';
    const typeStr = typeFilter === 'ALL' ? 'all' : typeFilter.toLowerCase();
    const filename = `gold_transactions_${typeStr}_${fromStr}_to_${toStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredTransactions.length} transactions to Excel`,
      variant: "default"
    });
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filters
                </Button>
                {filteredTransactions.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={exportToExcel}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Excel
                  </Button>
                )}
                {transactions.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearHistory}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Transaction Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="EXCHANGE">Exchange</SelectItem>
                      <SelectItem value="PURCHASE">Purchase</SelectItem>
                      <SelectItem value="SALE">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {filteredTransactions.length > 0 && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transactions: </span>
                    <span className="font-medium">{summary.totalTransactions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Weight: </span>
                    <span className="font-medium">{summary.totalWeight}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Fine Gold: </span>
                    <span className="font-medium">{summary.totalFineGold}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount: </span>
                    <span className="font-medium">₹{summary.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {transactions.length === 0 ? 'No transactions yet' : 'No transactions match the selected filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 border rounded-xl bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-lg">
                        {formatTransactionType(transaction.type)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {transaction.date.toLocaleDateString()} {transaction.date.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t.weight}: </span>
                        <span className="font-medium">{transaction.weight} {t.grams}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.fineGold}: </span>
                        <span className="font-medium">{transaction.fineGold} {t.grams}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.rate}: </span>
                        <span className="font-medium">{t.rupees}{transaction.rate}/{t.grams}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.amount}: </span>
                        <span className="font-bold text-lg text-primary">
                          {t.rupees}{transaction.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}