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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 md:px-6 lg:px-8">
      <Card className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl border-2 border-border shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Gold Ease Login</CardTitle>
          <p className="text-muted-foreground">Enter your 4-digit User ID and PIN</p>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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
                className="text-center text-base font-mono tracking-widest border-2 border-border focus:border-primary h-12 md:h-14"
                required
              />
              <p className="text-sm text-muted-foreground">Enter 4-digit User ID</p>
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
                className="text-center text-base font-mono tracking-widest border-2 border-border focus:border-primary h-12 md:h-14"
                required
              />
              <p className="text-sm text-muted-foreground">Enter 4-digit PIN</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 md:h-14 text-base font-semibold border-2 border-transparent hover:border-primary/20" 
              size="lg"
              disabled={isLoading || formData.userId.length !== 4 || formData.pin.length !== 4}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;