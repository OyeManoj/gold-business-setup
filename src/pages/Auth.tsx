import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Shield } from 'lucide-react';

const Auth = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format phone number to include country code if not provided
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
    
    setIsLoading(true);
    
    const { error } = await sendOTP(formattedPhone);
    
    if (error) {
      toast({
        title: "Failed to Send Code",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code Sent!",
        description: "Please check your phone for the 4-digit verification code.",
      });
      setStep('verify');
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 4-digit code.",
        variant: "destructive",
      });
      return;
    }
    
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
    
    setIsLoading(true);
    
    const { error } = await verifyOTP(formattedPhone, otp);
    
    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gold Ease Receipt</CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your phone number to get started'
              : 'Enter the 4-digit code sent to your phone'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send you a 4-digit verification code
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setOtp(value);
                    }}
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={4}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Code sent to {phone}
                </p>
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 4}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleBackToPhone}>
                  Change Phone Number
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;