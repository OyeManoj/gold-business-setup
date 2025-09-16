import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft, ShoppingCart, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: ArrowRightLeft,
      label: 'Exchange',
      path: '/transaction/exchange',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: ShoppingCart,
      label: 'Purchase',
      path: '/transaction/purchase',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: TrendingDown,
      label: 'Sale',
      path: '/transaction/sale',
      color: 'bg-red-500 hover:bg-red-600',
    },
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Speed Dial Actions */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={action.path}
              className={cn(
                "flex items-center gap-3 transition-all duration-200",
                `animate-in slide-in-from-bottom-2 fade-in-0`,
                `animation-delay-[${index * 50}ms]`
              )}
            >
              <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </div>
              <Button
                size="icon"
                onClick={() => handleActionClick(action.path)}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg text-white",
                  action.color,
                  "hover:scale-110 active:scale-95 transition-all duration-200"
                )}
              >
                <action.icon size={20} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90",
          "hover:scale-110 active:scale-95 transition-all duration-200",
          isOpen && "rotate-45"
        )}
      >
        <Plus size={24} className="text-primary-foreground" />
      </Button>
    </div>
  );
}