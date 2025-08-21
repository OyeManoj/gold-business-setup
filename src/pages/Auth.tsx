import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Shield, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userId.length !== 4 || pin.length !== 4) {
      toast({
        title: "Invalid Input",
        description: "Both User ID and PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = mode === 'signup' 
      ? await signUp(userId, pin)
      : await signIn(userId, pin);
    
    if (error) {
      toast({
        title: mode === 'signup' ? "Signup Failed" : "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: mode === 'signup' ? "Account Created!" : "Welcome back!",
        description: mode === 'signup' ? "Your account has been created successfully." : "You have successfully signed in.",
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gold Ease Receipt</CardTitle>
          <CardDescription>
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID (4 digits)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="1234"
                  value={userId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setUserId(value);
                  }}
                  className="pl-10 text-center text-xl tracking-widest"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN (4 digits)</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(value);
                  }}
                  className="pr-10 text-center text-xl tracking-widest"
                  maxLength={4}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || userId.length !== 4 || pin.length !== 4}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;