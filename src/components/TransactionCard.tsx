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
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50 bg-gradient-to-br from-background to-gold-light/20",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mb-3 shadow-lg">
          <Icon size={32} className="text-foreground" />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}