import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function ChangePinDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    if (!/^\d{4}$/.test(newPin)) {
      toast.error('New PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('New PINs do not match');
      return;
    }
    if (currentPin === newPin) {
      toast.error('New PIN must be different from current PIN');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('change_own_pin', {
        input_user_id: user.user_id,
        input_current_pin: currentPin,
        input_new_pin: newPin,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const result = data as any;
      if (result?.success) {
        toast.success('PIN changed successfully');
        setOpen(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        toast.error(result?.error || 'Failed to change PIN');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm whitespace-nowrap"
        >
          <KeyRound size={16} />
          <span className="font-medium hidden sm:inline">Change PIN</span>
          <span className="font-medium sm:hidden">PIN</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Your PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="current-pin">Current PIN</Label>
            <Input
              id="current-pin"
              type="password"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
              placeholder="Enter current 4-digit PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input
              id="new-pin"
              type="password"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
              placeholder="Enter new 4-digit PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
              placeholder="Re-enter new PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentPin || !newPin || !confirmPin}
            className="w-full"
          >
            {isSubmitting ? 'Changing...' : 'Change PIN'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
