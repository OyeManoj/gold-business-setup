import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription, subscription } = useSubscription();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshStatus = async () => {
      try {
        await checkSubscription();
        toast({
          title: "Welcome to Gold Ease Receipt!",
          description: "Your subscription is now active. Enjoy all premium features!",
        });
      } catch (error) {
        console.error('Failed to refresh subscription status:', error);
      }
    };

    if (sessionId) {
      // Wait a moment for Stripe to process, then refresh
      setTimeout(refreshStatus, 2000);
    }
  }, [sessionId, checkSubscription, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Subscription Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Thank you for subscribing to Gold Ease Receipt! Your payment has been processed successfully.
            </p>
            
            {subscription.subscribed && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  Plan: {subscription.subscription_tier}
                </p>
                {subscription.subscription_end && (
                  <p className="text-green-600 text-sm">
                    Next billing: {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• Access all premium features</li>
              <li>• Generate professional receipts</li>
              <li>• View advanced analytics</li>
              <li>• Get priority support</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Start Using Gold Ease Receipt
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/pricing')}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-foreground">
              Transaction ID: {sessionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;