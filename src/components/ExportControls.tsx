import { Button } from '@/components/ui/button';
import { Download, Filter, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { ExportSummary, exportTransactionsToExcel } from '@/utils/exportUtils';
import { TransactionFilters } from '@/utils/filterUtils';
import { useToast } from '@/hooks/use-toast';

interface ExportControlsProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  summary: ExportSummary;
  filters: TransactionFilters;
  showFilters: boolean;
  language: string;
  onToggleFilters: () => void;
  onClearHistory: () => void;
}

export function ExportControls({
  transactions,
  filteredTransactions,
  summary,
  filters,
  showFilters,
  language,
  onToggleFilters,
  onClearHistory
}: ExportControlsProps) {
  const { toast } = useToast();

  const handleExport = () => {
    exportTransactionsToExcel(filteredTransactions, summary, filters, language);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredTransactions.length} transactions to Excel`,
      variant: "default"
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFilters}
        className="flex items-center gap-2"
      >
        <Filter size={16} />
        Filters
      </Button>
      {filteredTransactions.length > 0 && (
        <Button
          variant="default"
          size="sm"
          onClick={handleExport}
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
          onClick={onClearHistory}
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          Clear
        </Button>
      )}
    </div>
  );
}