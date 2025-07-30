import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface TransactionButtonProps {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}

export function TransactionButton({ icon: Icon, title, onClick }: TransactionButtonProps) {
  return (
    <Button
      variant="gold"
      size="transaction"
      onClick={onClick}
      className="w-full h-32 flex flex-col items-center justify-center gap-3 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Icon size={48} />
      <span>{title}</span>
    </Button>
  );
}