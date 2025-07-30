import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  maxDigits?: number;
}

export function NumericKeypad({ 
  value, 
  onChange, 
  allowDecimal = true, 
  maxDigits = 10 
}: NumericKeypadProps) {
  const handleNumber = (num: string) => {
    if (value.length >= maxDigits) return;
    onChange(value + num);
  };

  const handleDecimal = () => {
    if (!allowDecimal || value.includes('.')) return;
    onChange(value + '.');
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
      {/* Numbers 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          variant="outline"
          size="lg"
          onClick={() => handleNumber(num.toString())}
          className="h-16 text-2xl font-semibold"
        >
          {num}
        </Button>
      ))}
      
      {/* Bottom row: Clear, 0, Decimal/Backspace */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleClear}
        className="h-16 text-lg font-semibold text-destructive"
      >
        C
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleNumber('0')}
        className="h-16 text-2xl font-semibold"
      >
        0
      </Button>
      
      {allowDecimal ? (
        <Button
          variant="outline"
          size="lg"
          onClick={handleDecimal}
          className="h-16 text-2xl font-semibold"
          disabled={value.includes('.')}
        >
          .
        </Button>
      ) : (
        <Button
          variant="outline"
          size="lg"
          onClick={handleBackspace}
          className="h-16 text-lg"
        >
          <Delete size={24} />
        </Button>
      )}
      
      {/* Backspace button (spans full width) */}
      <Button
        variant="secondary"
        size="lg"
        onClick={handleBackspace}
        className="col-span-3 h-12 text-lg mt-2"
      >
        <Delete size={20} className="mr-2" />
        Backspace
      </Button>
    </div>
  );
}