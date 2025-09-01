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
import { Hash, Lock, User, Shield } from 'lucide-react';
import goldBarsLogo from '@/assets/gold-bars-logo.png';

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
    role: 'employee' as 'admin' | 'employee',
    userId: '',
    useManualUserId: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableUserIds, setAvailableUserIds] = useState<string[]>([]);
  const [useManualInput, setUseManualInput] = useState(false);

  // Fetch available user IDs and set up real-time subscription
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const { data, error } = await supabase.rpc('get_active_user_ids');
        
        if (!error && data) {
          setAvailableUserIds(data);
        }
      } catch (error) {
        console.error('Error fetching user IDs:', error);
      }
    };

    fetchUserIds();

    // Set up real-time subscription for new user signups
    const subscription = supabase
      .channel('custom_users_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'custom_users' 
        }, 
        (payload) => {
          const newUser = payload.new as any;
          if (newUser.is_active) {
            setAvailableUserIds(prev => [newUser.user_id, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

    const result = await signUp(signUpData.name, signUpData.pin, signUpData.role, signUpData.useManualUserId ? signUpData.userId : undefined);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Account created! Your User ID is: ${result.userId}. Please save this ID for login.`);
      // Clear form after successful signup
      setSignUpData({ name: '', pin: '', role: 'employee', userId: '', useManualUserId: false });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 md:px-6 lg:px-8">
      <Card className="w-full max-w-2xl border-2 border-border shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
            <img 
              src={goldBarsLogo} 
              alt="Gold Ease Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Gold Ease
          </CardTitle>
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
                  <Label className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    User ID
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="manual-userid"
                        checked={signUpData.useManualUserId}
                        onChange={(e) => setSignUpData(prev => ({ 
                          ...prev, 
                          useManualUserId: e.target.checked,
                          userId: e.target.checked ? prev.userId : ''
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="manual-userid" className="text-sm font-normal">
                        Choose my own User ID
                      </Label>
                    </div>
                    
                    {signUpData.useManualUserId && (
                      <Input
                        type="text"
                        value={signUpData.userId}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setSignUpData(prev => ({ ...prev, userId: value }));
                        }}
                        placeholder="Enter 4-digit User ID"
                        className="h-12 text-center text-lg tracking-widest"
                        maxLength={4}
                        required
                      />
                    )}
                    
                    {!signUpData.useManualUserId && (
                      <p className="text-sm text-muted-foreground">
                        A random 4-digit User ID will be generated for you
                      </p>
                    )}
                  </div>
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