import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, KeyRound, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.userId, formData.pin);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only digits, max 4
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Gold Ease Login</CardTitle>
          <p className="text-muted-foreground">Enter your 4-digit User ID and PIN</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="userId" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User ID
              </Label>
              <Input
                id="userId"
                type="text"
                value={formData.userId}
                onChange={handleInputChange('userId')}
                placeholder="1234"
                maxLength={4}
                className="text-center text-lg font-mono tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground">Enter 4-digit User ID</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                value={formData.pin}
                onChange={handleInputChange('pin')}
                placeholder="••••"
                maxLength={4}
                className="text-center text-lg font-mono tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground">Enter 4-digit PIN</p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || formData.userId.length !== 4 || formData.pin.length !== 4}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <h4 className="text-sm font-medium text-foreground mb-2">Demo Accounts:</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Admin: ID <span className="font-mono">1001</span>, PIN <span className="font-mono">1234</span> (Full Access)</p>
                <p>Employee: ID <span className="font-mono">1002</span>, PIN <span className="font-mono">9999</span> (No History Access)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;