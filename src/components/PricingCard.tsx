import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface PricingCardProps {
  planId: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly?: number;
  maxTransactions?: number;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  billingCycle: 'monthly' | 'yearly';
}

export function PricingCard({
  planId,
  name,
  description,
  priceMonthly,
  priceYearly,
  maxTransactions,
  features,
  isPopular = false,
  isCurrentPlan = false,
  billingCycle
}: PricingCardProps) {
  const { createCheckout } = useSubscription();
  const { toast } = useToast();

  const price = billingCycle === 'yearly' ? priceYearly || priceMonthly * 12 : priceMonthly;
  const monthlyPrice = billingCycle === 'yearly' ? (priceYearly || priceMonthly * 12) / 12 : priceMonthly;
  const savings = priceYearly && billingCycle === 'yearly' ? ((priceMonthly * 12 - priceYearly) / (priceMonthly * 12)) * 100 : 0;

  const handleSubscribe = async () => {
    try {
      await createCheckout(planId, billingCycle);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : 'border-border'} transition-all duration-200 hover:shadow-lg`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
          Current Plan
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
        
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">${monthlyPrice.toFixed(0)}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          
          {billingCycle === 'yearly' && savings > 0 && (
            <div className="text-sm text-green-600 mt-1">
              Save {savings.toFixed(0)}% annually
            </div>
          )}
          
          {billingCycle === 'yearly' && (
            <div className="text-xs text-muted-foreground mt-1">
              Billed annually (${price.toFixed(0)}/year)
            </div>
          )}
        </div>

        {maxTransactions && (
          <div className="text-sm text-muted-foreground mt-2">
            Up to {maxTransactions.toLocaleString()} transactions/month
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : (isPopular ? "default" : "outline")}
          onClick={handleSubscribe}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Get Started"}
        </Button>
      </CardFooter>
    </Card>
  );
}