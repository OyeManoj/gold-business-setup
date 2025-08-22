import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  onClick: () => void;
  className?: string;
}

export function TransactionCard({ 
  title, 
  icon: Icon, 
  description, 
  onClick, 
  className 
}: TransactionCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer border-border shadow-elegant hover:shadow-xl transform hover:-translate-y-1 sm:hover:-translate-y-2 bg-card backdrop-blur-sm transition-all duration-500 active:scale-[0.98] touch-manipulation",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="text-center pb-2 sm:pb-3 p-4 sm:p-6">
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-primary rounded-2xl shadow-lg"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            <Icon size={24} className="text-primary-foreground sm:hidden" />
            <Icon size={32} className="text-primary-foreground hidden sm:block" />
          </div>
        </div>
        <CardTitle className="text-lg sm:text-xl font-medium text-foreground leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pt-0 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}