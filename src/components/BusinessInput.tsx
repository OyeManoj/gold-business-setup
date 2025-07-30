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
        <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              "h-12 text-lg font-medium border-2 focus:border-primary",
              error && "border-destructive",
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

BusinessInput.displayName = "BusinessInput";