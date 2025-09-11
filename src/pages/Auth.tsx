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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Hash className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Gold Ease Access</CardTitle>
          <CardDescription>
            Enter your 4-digit User ID and PIN to access the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-userid">User ID (4 digits)</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signInData.userId}
                      onChange={(value) => setSignInData(prev => ({ ...prev, userId: value }))}
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
                  disabled={isLoading || signInData.userId.length !== 4 || signInData.pin.length !== 4}
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
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {success}
                    {newUserId && (
                      <div className="mt-2 p-2 bg-white rounded text-center font-mono text-lg font-bold">
                        {newUserId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-4">
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
                  <Label htmlFor="signup-userid">Choose User ID (4 digits) - Optional</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={signUpData.userId}
                      onChange={(value) => setSignUpData(prev => ({ ...prev, userId: value }))}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Leave empty for auto-generated ID
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-pin">Create PIN (4 digits)</Label>
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
                  disabled={isLoading || !signUpData.name || signUpData.pin.length !== 4 || (signUpData.userId.length > 0 && signUpData.userId.length !== 4)}
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