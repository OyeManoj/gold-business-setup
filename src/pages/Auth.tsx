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
import { Loader2, Hash, User, CheckCircle } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, isLoading } = useAuth();
  
  const [signInData, setSignInData] = useState({
    userId: '',
    pin: ''
  });
  
  const [signUpData, setSignUpData] = useState({
    name: '',
    userId: '',
    pin: '',
    role: 'employee' as 'admin' | 'employee'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newUserId, setNewUserId] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signInData.userId || !signInData.pin) {
      setError('Please enter both User ID and PIN');
      return;
    }

    const { error } = await signIn(signInData.userId, signInData.pin);
    
    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signUpData.name || !signUpData.pin) {
      setError('Please fill in all fields');
      return;
    }

    if (signUpData.pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (signUpData.userId && signUpData.userId.length !== 4) {
      setError('User ID must be exactly 4 digits');
      return;
    }

    const { error, user_id } = await signUp(signUpData.name, signUpData.pin, signUpData.role, signUpData.userId);
    
    if (error) {
      setError(error);
    } else if (user_id) {
      setNewUserId(user_id);
      setSuccess(`Account created successfully! Your User ID is: ${user_id}`);
      setSignUpData({ name: '', userId: '', pin: '', role: 'employee' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/90 shadow-elegant border-0 relative z-10 animate-scale-in">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-strong">
            <Hash className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Gold Ease Access
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Secure 4-digit authentication system
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-6 mt-6">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signin-userid" className="text-sm font-medium">User ID (4 digits)</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signInData.userId}
                      onChange={(value) => setSignInData(prev => ({ ...prev, userId: value }))}
                      className="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signin-pin" className="text-sm font-medium">PIN (4 digits)</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signInData.pin}
                      onChange={(value) => setSignInData(prev => ({ ...prev, pin: value }))}
                      className="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-strong text-lg font-medium transition-all duration-300"
                  disabled={isLoading || signInData.userId.length !== 4 || signInData.pin.length !== 4}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6 mt-6">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-success/20 bg-success/5 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {success}
                    {newUserId && (
                      <div className="mt-3 p-3 bg-card rounded-xl text-center font-mono text-lg font-bold border border-success/20">
                        {newUserId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-12 border-2 rounded-xl"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signup-userid" className="text-sm font-medium">Choose User ID (4 digits) - Optional</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signUpData.userId}
                      onChange={(value) => setSignUpData(prev => ({ ...prev, userId: value }))}
                      className="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Leave empty for auto-generated ID
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signup-pin" className="text-sm font-medium">Create PIN (4 digits)</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signUpData.pin}
                      onChange={(value) => setSignUpData(prev => ({ ...prev, pin: value }))}
                      className="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg font-semibold border-2 rounded-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signup-role" className="text-sm font-medium">Role</Label>
                  <Select
                    value={signUpData.role}
                    onValueChange={(value: 'admin' | 'employee') => 
                      setSignUpData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="h-12 border-2 rounded-xl">
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
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-strong text-lg font-medium transition-all duration-300"
                  disabled={isLoading || !signUpData.name || signUpData.pin.length !== 4 || (signUpData.userId.length > 0 && signUpData.userId.length !== 4)}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
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