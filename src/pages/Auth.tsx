import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, User, KeyRound } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signInWithPin, signUpWithPin } = useAuth();
  
  const [signInData, setSignInData] = useState({
    userId: '',
    pin: ''
  });
  
  const [signUpData, setSignUpData] = useState({
    name: '',
    pin: '',
    role: 'employee' as 'admin' | 'employee'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!signInData.userId || !signInData.pin) {
      setError('Please enter both User ID and PIN');
      setIsLoading(false);
      return;
    }

    const { error } = await signInWithPin(signInData.userId, signInData.pin);
    
    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!signUpData.name || !signUpData.pin) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (signUpData.pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      setIsLoading(false);
      return;
    }

    const { error, userId } = await signUpWithPin(signUpData.name, signUpData.pin, signUpData.role);
    
    if (error) {
      setError(error);
    } else {
      setSuccess(`Account created successfully! Your User ID is: ${userId}. Please save this ID to sign in.`);
      setSignUpData({ name: '', pin: '', role: 'employee' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">PIN Authentication</CardTitle>
          <CardDescription>
            Enter your 4-digit User ID and PIN to access your account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-userid">User ID (4 digits)</Label>
                  <Input
                    id="signin-userid"
                    type="text"
                    placeholder="Enter your 4-digit User ID"
                    maxLength={4}
                    value={signInData.userId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setSignInData(prev => ({ ...prev, userId: value }));
                    }}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-pin">PIN (4 digits)</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signInData.pin}
                      onChange={(value) => setSignInData(prev => ({ ...prev, pin: value }))}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-pin">Create 4-digit PIN</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signUpData.pin}
                      onChange={(value) => setSignUpData(prev => ({ ...prev, pin: value }))}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Choose a secure 4-digit PIN to protect your account
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <Select
                    value={signUpData.role}
                    onValueChange={(value: 'admin' | 'employee') => 
                      setSignUpData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
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
}