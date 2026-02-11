import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, Shield, Users, RefreshCw, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ManagedUser {
  id: string;
  user_id: string;
  name: string;
  role: string;
  created_at: string;
  last_login: string | null;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resetPinUserId, setResetPinUserId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (user && !hasPermission('user-management')) {
      navigate('/', { replace: true });
    }
  }, [user, hasPermission, navigate]);

  const fetchUsers = async () => {
    if (!user?.user_id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_custom_users', {
        input_admin_user_id: user.user_id
      });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        setUsers(result.users || []);
      } else {
        toast({ title: 'Error', description: result?.error || 'Failed to load users', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.user_id]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!user?.user_id) return;
    try {
      const { data, error } = await supabase.rpc('update_custom_user_role', {
        input_admin_user_id: user.user_id,
        input_target_user_id: targetUserId,
        input_new_role: newRole
      });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        toast({ title: 'Role updated', description: `User ${targetUserId} is now ${newRole}` });
        fetchUsers();
      } else {
        toast({ title: 'Error', description: result?.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!user?.user_id) return;
    try {
      const { data, error } = await supabase.rpc('delete_custom_user', {
        input_admin_user_id: user.user_id,
        input_target_user_id: targetUserId
      });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        toast({ title: 'User deleted', description: `User ${targetUserId} has been removed` });
        fetchUsers();
      } else {
        toast({ title: 'Error', description: result?.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleResetPin = async () => {
    if (!user?.user_id || !resetPinUserId || !newPin) return;
    if (newPin.length < 4) {
      toast({ title: 'Error', description: 'PIN must be at least 4 digits', variant: 'destructive' });
      return;
    }
    setIsResetting(true);
    try {
      const { data, error } = await supabase.rpc('reset_custom_user_pin', {
        input_admin_user_id: user.user_id,
        input_target_user_id: resetPinUserId,
        input_new_pin: newPin
      });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        toast({ title: 'PIN reset', description: `PIN for user ${resetPinUserId} has been updated` });
        setResetPinUserId(null);
        setNewPin('');
      } else {
        toast({ title: 'Error', description: result?.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsResetting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <Users size={24} />
                USER MANAGEMENT
              </h1>
              <p className="text-sm text-muted-foreground">{users.length} registered users</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading} className="gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Users Table */}
        <Card className="border-2 border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="hidden sm:table-cell">Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono font-bold">{u.user_id}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(val) => handleRoleChange(u.user_id, val)}
                            disabled={u.user_id === user?.user_id}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-1">
                                  <Shield size={12} />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(u.created_at)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(u.last_login)}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.user_id === user?.user_id ? (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setResetPinUserId(u.user_id); setNewPin(''); }}
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              >
                                <KeyRound size={14} />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                    <Trash2 size={14} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete user {u.user_id}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete {u.name}'s account and all their transactions. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(u.user_id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PIN Reset Dialog */}
        <Dialog open={!!resetPinUserId} onOpenChange={(open) => { if (!open) { setResetPinUserId(null); setNewPin(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset PIN for user {resetPinUserId}</DialogTitle>
              <DialogDescription>Enter a new 4-digit PIN for this user.</DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="New 4-digit PIN"
              maxLength={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setResetPinUserId(null); setNewPin(''); }}>Cancel</Button>
              <Button onClick={handleResetPin} disabled={isResetting || newPin.length < 4}>
                {isResetting ? 'Resetting...' : 'Reset PIN'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
