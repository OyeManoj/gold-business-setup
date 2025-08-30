import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, UserPlus, Hash, Lock, User, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
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
  const [availableUserIds, setAvailableUserIds] = useState<string[]>([]);
  const [useManualInput, setUseManualInput] = useState(false);

  // Fetch available user IDs
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_users')
          .select('user_id')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setAvailableUserIds(data.map(user => user.user_id));
        }
      } catch (error) {
        console.error('Error fetching user IDs:', error);
      }
    };

    fetchUserIds();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await signIn(signInData.userId, signInData.pin);
    
    if (result.error) {
      setError(result.error);
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

    const result = await signUp(signUpData.name, signUpData.pin, signUpData.role);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Account created! Your User ID is: ${result.userId}. Please save this ID for login.`);
      // Clear form after successful signup
      setSignUpData({ name: '', pin: '', role: 'employee' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 md:px-6 lg:px-8">
      <Card className="w-full max-w-2xl border-2 border-border shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Gold Ease</CardTitle>
          <p className="text-muted-foreground">Access your account</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signin-userid" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    User ID
                  </Label>
                  
                  {!useManualInput && availableUserIds.length > 0 ? (
                    <>
                      <Select 
                        value={signInData.userId} 
                        onValueChange={(value) => setSignInData(prev => ({ ...prev, userId: value }))}
                      >
                        <SelectTrigger className="h-12 text-center text-lg tracking-widest">
                          <SelectValue placeholder="Select User ID" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUserIds.map((userId) => (
                            <SelectItem key={userId} value={userId} className="text-center tracking-widest">
                              {userId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUseManualInput(true)}
                        className="w-full text-sm"
                      >
                        Enter User ID manually instead
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="signin-userid"
                        type="text"
                        value={signInData.userId}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setSignInData(prev => ({ ...prev, userId: value }));
                        }}
                        placeholder="Enter 4-digit User ID"
                        className="h-12 text-center text-lg tracking-widest"
                        maxLength={4}
                        required
                      />
                      {availableUserIds.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUseManualInput(false);
                            setSignInData(prev => ({ ...prev, userId: '' }));
                          }}
                          className="w-full text-sm"
                        >
                          Select from existing User IDs instead
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-pin" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    PIN
                  </Label>
                  <Input
                    id="signin-pin"
                    type="password"
                    value={signInData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setSignInData(prev => ({ ...prev, pin: value }));
                    }}
                    placeholder="Enter 4-digit PIN"
                    className="h-12 text-center text-lg tracking-widest"
                    maxLength={4}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-pin" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    PIN
                  </Label>
                  <Input
                    id="signup-pin"
                    type="password"
                    value={signUpData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setSignUpData(prev => ({ ...prev, pin: value }));
                    }}
                    placeholder="Create 4-digit PIN"
                    className="h-12 text-center text-lg tracking-widest"
                    maxLength={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-role" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <Select 
                    value={signUpData.role} 
                    onValueChange={(value: 'admin' | 'employee') => 
                      setSignUpData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;