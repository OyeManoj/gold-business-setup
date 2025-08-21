import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [userIdPin, setUserIdPin] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateInputs = () => {
    if (userIdPin.length !== 4 || !/^\d+$/.test(userIdPin)) {
      toast({
        title: "Invalid User ID",
        description: "User ID must be exactly 4 digits",
        variant: "destructive",
      });
      return false;
    }
    
    if (pinCode.length !== 4 || !/^\d+$/.test(pinCode)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    const { error } = await signIn(userIdPin, pinCode);
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    const { error } = await signUp(userIdPin, pinCode);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "You can now use your User ID and PIN to sign in.",
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setUserIdPin(value);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPinCode(value);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gold Ease Receipt</CardTitle>
          <CardDescription>
            Professional gold business management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-userid">User ID (4 digits)</Label>
                  <Input
                    id="signin-userid"
                    type="text"
                    placeholder="Enter your 4-digit User ID"
                    value={userIdPin}
                    onChange={handleUserIdChange}
                    maxLength={4}
                    required
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-pin">PIN (4 digits)</Label>
                  <Input
                    id="signin-pin"
                    type="password"
                    placeholder="Enter your 4-digit PIN"
                    value={pinCode}
                    onChange={handlePinChange}
                    maxLength={4}
                    required
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-userid">Choose User ID (4 digits)</Label>
                  <Input
                    id="signup-userid"
                    type="text"
                    placeholder="Choose your 4-digit User ID"
                    value={userIdPin}
                    onChange={handleUserIdChange}
                    maxLength={4}
                    required
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-pin">Choose PIN (4 digits)</Label>
                  <Input
                    id="signup-pin"
                    type="password"
                    placeholder="Choose your 4-digit PIN"
                    value={pinCode}
                    onChange={handlePinChange}
                    maxLength={4}
                    required
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;