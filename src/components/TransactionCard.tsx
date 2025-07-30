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
        "cursor-pointer border-0 shadow-elegant hover:shadow-lg transform hover:-translate-y-2 bg-gradient-to-br from-card via-card to-muted/50 backdrop-blur-sm transition-all duration-500",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="text-center pb-3">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-gold-dark/30 rounded-2xl shadow-lg"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            <Icon size={32} className="text-gold-dark" />
          </div>
        </div>
        <CardTitle className="text-xl font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}