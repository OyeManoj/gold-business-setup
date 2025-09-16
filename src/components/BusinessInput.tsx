import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BusinessInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  error?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const BusinessInput = forwardRef<HTMLInputElement, BusinessInputProps>(
  ({ label, unit, error, className, onKeyPress, ...props }, ref) => {
    return (
      <div className="space-y-3">
        <Label htmlFor={props.id} className="text-sm font-semibold text-foreground tracking-tight">
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              "h-12 text-base font-medium border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-soft hover:shadow-md hover:border-primary/50",
              unit ? "pr-20" : "",
              error && "ring-2 ring-destructive/20 border-destructive bg-destructive/5 focus:ring-destructive/20",
              className
            )}
            onKeyPress={onKeyPress}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/30 backdrop-blur-sm">
                {unit}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive font-medium flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-destructive"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

BusinessInput.displayName = "BusinessInput";