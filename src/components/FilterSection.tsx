import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionFilters } from '@/utils/filterUtils';

interface FilterSectionProps {
  filters: TransactionFilters;
  onFilterChange: (key: keyof TransactionFilters, value: string) => void;
}

export function FilterSection({ filters, onFilterChange }: FilterSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <label className="text-sm font-medium">From Date</label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">To Date</label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange('dateTo', e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Transaction Type</label>
        <Select value={filters.typeFilter} onValueChange={(value) => onFilterChange('typeFilter', value)}>
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
  );
}