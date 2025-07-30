import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BusinessInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  error?: string;
}

export const BusinessInput = forwardRef<HTMLInputElement, BusinessInputProps>(
  ({ label, unit, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              "h-12 text-base font-medium border-2 border-champagne/60 rounded-xl bg-champagne/40 focus:bg-white focus:ring-2 focus:ring-gold/60 focus:border-gold/50 focus:ring-offset-0 transition-all duration-200 shadow-sm",
              error && "ring-2 ring-destructive/60 bg-destructive/10 border-destructive/40",
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                {unit}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

BusinessInput.displayName = "BusinessInput";