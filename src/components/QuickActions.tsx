import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '@/utils/storage';
import { Transaction } from '@/types/transaction';
import { Clock, Repeat, TrendingUp } from 'lucide-react';
import { formatIndianCurrency, formatWeight } from '@/utils/indianFormatting';

interface QuickActionsProps {
  language: string;
}

export function QuickActions({ language }: QuickActionsProps) {
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadRecentTransactions = async () => {
      const transactions = await getTransactions();
      const recent = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      setRecentTransactions(recent);
    };
    loadRecentTransactions();
  }, []);

  const quickPresets = [
    { label: '22K Gold', purity: 91.6, weight: 10, rate: 6000 },
    { label: '24K Gold', purity: 99.9, weight: 10, rate: 6500 },
    { label: '18K Gold', purity: 75, weight: 10, rate: 4500 },
  ];

  const handleQuickTransaction = (type: string, preset?: any) => {
    const params = new URLSearchParams();
    if (preset) {
      params.set('weight', preset.weight.toString());
      params.set('purity', preset.purity.toString());
      params.set('rate', preset.rate.toString());
    }
    navigate(`/transaction/${type}?${params.toString()}`);
  };

  const handleRepeatTransaction = (transaction: Transaction) => {
    const params = new URLSearchParams();
    params.set('weight', transaction.weight.toString());
    if (transaction.purity) params.set('purity', transaction.purity.toString());
    if (transaction.rate) params.set('rate', transaction.rate.toString());
    if (transaction.reduction) params.set('reduction', transaction.reduction.toString());
    
    navigate(`/transaction/${transaction.type.toLowerCase()}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Quick Presets */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-semibold text-primary">Quick Start</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickPresets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickTransaction('purchase', preset)}
                className="h-auto p-3 flex flex-col items-start border-primary/30 hover:bg-primary/10"
              >
                <div className="font-medium text-sm">{preset.label}</div>
                <div className="text-xs text-muted-foreground">
                  {preset.purity}% • ₹{preset.rate}/g
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card className="bg-gradient-to-r from-muted/5 to-muted/10 border-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Recent Transactions</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                Quick Repeat
              </Badge>
            </div>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:bg-muted/20 cursor-pointer transition-all duration-200"
                  onClick={() => handleRepeatTransaction(transaction)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                    <div className="text-sm">
                      <div className="font-medium">{formatWeight(transaction.weight)}</div>
                      <div className="text-muted-foreground text-xs">
                        {formatIndianCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Repeat size={12} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}