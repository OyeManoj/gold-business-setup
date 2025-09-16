import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTransactions } from '@/utils/storage';
import { TransactionType } from '@/types/transaction';
import { Clock } from 'lucide-react';

interface SmartDefaultsProps {
  transactionType: TransactionType;
  onApplyDefaults: (defaults: { weight?: string; purity?: string; rate?: string; reduction?: string }) => void;
}

export function SmartDefaults({ transactionType, onApplyDefaults }: SmartDefaultsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const loadSuggestions = async () => {
      const transactions = await getTransactions();
      const filtered = transactions
        .filter(t => t.type === transactionType)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      // Get most common values
      const weights = filtered.map(t => t.weight).filter((v, i, arr) => arr.indexOf(v) === i);
      const purities = filtered.map(t => t.purity).filter((v, i, arr) => arr.indexOf(v) === i);
      const rates = filtered.map(t => t.rate).filter((v, i, arr) => arr.indexOf(v) === i);

      const suggestions = [
        ...weights.slice(0, 2).map(w => ({ type: 'weight', value: w, label: `${w}g` })),
        ...purities.slice(0, 2).map(p => ({ type: 'purity', value: p, label: `${p}%` })),
        ...rates.slice(0, 2).map(r => ({ type: 'rate', value: r, label: `₹${r}/g` })),
      ];

      setSuggestions(suggestions.slice(0, 4));
    };

    loadSuggestions();
  }, [transactionType]);

  const handleApplySuggestion = (suggestion: any) => {
    const defaults: any = {};
    defaults[suggestion.type] = suggestion.value.toString();
    onApplyDefaults(defaults);
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-muted/10 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Quick Fill</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleApplySuggestion(suggestion)}
            className="h-7 px-3 text-xs border-primary/30 hover:bg-primary/10"
          >
            <Badge variant="secondary" className="mr-1 text-xs px-1">
              {suggestion.type}
            </Badge>
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
}