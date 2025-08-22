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
      <div className="space-y-2 md:space-y-3">
        <Label htmlFor={props.id} className="text-sm md:text-base font-semibold text-foreground">
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              "h-12 md:h-14 text-base md:text-lg font-medium border-2 border-border rounded-lg bg-background focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm hover:shadow-md",
              error && "ring-2 ring-destructive border-destructive bg-destructive/5",
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm md:text-base font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border/50">
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