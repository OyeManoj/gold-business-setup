import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp, isLoading } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPin, setSignupPin] = useState('');
  const [signupUserId, setSignupUserId] = useState('');
  const [signupRole, setSignupRole] = useState<'admin' | 'employee'>('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signIn(loginId, loginPin);
    if (result.error) setError(result.error);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = await signUp(signupName, signupPin, signupRole, signupUserId || undefined);
    if (result.error) {
      setError(result.error);
    } else if (result.user_id) {
      setSuccess(`Account created! Your User ID is: ${result.user_id} (Role: ${signupRole})`);
      setSignupName('');
      setSignupPin('');
      setSignupUserId('');
      setSignupRole('employee');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

      <Card className="relative z-10 w-full max-w-md border-2 border-border">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-extrabold tracking-tighter">GOLD EASE</CardTitle>
          <p className="text-sm text-muted-foreground">Transaction Management System</p>
          <div className="w-16 h-1 bg-primary mx-auto mt-2" />
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              {success}
            </div>
          )}

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="gap-2"><LogIn size={14} />Login</TabsTrigger>
              <TabsTrigger value="signup" className="gap-2"><UserPlus size={14} />Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">User ID</label>
                  <Input
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter your 4-digit User ID"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">PIN</label>
                  <Input
                    type="password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Enter your PIN"
                    maxLength={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                  <Input
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">PIN (4 digits)</label>
                  <Input
                    type="password"
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value)}
                    placeholder="Choose a 4-digit PIN"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">User ID (optional)</label>
                  <Input
                    value={signupUserId}
                    onChange={(e) => setSignupUserId(e.target.value)}
                    placeholder="Custom 4-digit ID or auto-generated"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                  <Select value={signupRole} onValueChange={(v) => setSignupRole(v as 'admin' | 'employee')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
