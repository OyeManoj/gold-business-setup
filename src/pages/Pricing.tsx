import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PricingCard } from '@/components/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_transactions: number;
  features: string[];
}

const Pricing = () => {
  const navigate = useNavigate();
  const { subscription, loading: subscriptionLoading, checkSubscription, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;

        const formattedPlans = data?.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : []
        })) || [];

        setPlans(formattedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load pricing plans",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      await checkSubscription();
      toast({
        title: "Success",
        description: "Subscription status refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh subscription status",
        variant: "destructive",
      });
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading pricing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to App
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Choose Your Plan
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshSubscription}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
            {subscription.subscribed && (
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                className="flex items-center gap-2"
              >
                Manage Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Setup Status Notice */}
        <div className="mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Setup Required for Live Payments
                  </h3>
                  <p className="text-blue-700 text-sm mb-3">
                    To enable live subscriptions, configure your Stripe secret key in the edge functions. 
                    The pricing page is ready - just add your Stripe credentials to start accepting payments!
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      Get Stripe API Keys
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://supabase.com/dashboard/project/zjwpcnsmkbestuhalqps/settings/functions', '_blank')}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      Configure Edge Functions
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Subscription Status */}
        {subscription.subscribed && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Active Subscription: {subscription.subscription_tier}
                  </h3>
                  {subscription.subscription_end && (
                    <p className="text-green-600">
                      Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button onClick={handleManageSubscription} variant="outline">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
            Monthly
          </span>
          <Switch
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <span className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="text-sm text-green-600 font-medium">Save up to 17%</span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              planId={plan.id}
              name={plan.name}
              description={plan.description}
              priceMonthly={plan.price_monthly}
              priceYearly={plan.price_yearly}
              maxTransactions={plan.max_transactions}
              features={plan.features}
              isPopular={index === 1} // Make the middle plan popular
              isCurrentPlan={subscription.subscribed && subscription.subscription_tier === plan.name}
              billingCycle={billingCycle}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What happens if I exceed my transaction limit?</h3>
              <p className="text-muted-foreground">
                You'll receive notifications as you approach your limit. If exceeded, you can upgrade your plan or wait for the next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time through the customer portal. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;