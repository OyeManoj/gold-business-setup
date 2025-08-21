import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({ subscribed: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscription({ subscribed: false });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('check-subscription');
      
      if (functionError) {
        // If Stripe is not configured yet, default to unsubscribed
        console.warn('Subscription check failed (likely Stripe not configured):', functionError.message);
        setSubscription({ subscribed: false });
        return;
      }

      setSubscription(data || { subscribed: false });
    } catch (err) {
      console.warn('Error checking subscription (Stripe may not be configured):', err);
      // Gracefully handle errors by defaulting to unsubscribed
      setSubscription({ subscribed: false });
      setError(null); // Don't show error to user if Stripe isn't configured yet
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, billingCycle }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }

      return data;
    } catch (err) {
      console.error('Error creating checkout:', err);
      throw err;
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }

      return data;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    subscription,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isSubscribed: subscription.subscribed,
    subscriptionTier: subscription.subscription_tier,
  };
}