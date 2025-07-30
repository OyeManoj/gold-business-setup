import { ExportSummary } from '@/utils/exportUtils';

interface TransactionSummaryCardProps {
  summary: ExportSummary;
}

export function TransactionSummaryCard({ summary }: TransactionSummaryCardProps) {
  return (
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
  );
}