import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, User, Mail, Phone, FileText, Camera } from 'lucide-react';

interface UserProfileData {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'employee';
  display_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_user_profile', {
        input_user_id: user.user_id
      });

      if (error) throw error;

      if (data.success) {
        const profileData = data.profile;
        setProfile(profileData);
        setFormData({
          display_name: profileData.display_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const { data, error } = await supabase.rpc('update_user_profile', {
        input_user_id: user.user_id,
        input_display_name: formData.display_name || null,
        input_email: formData.email || null,
        input_phone: formData.phone || null,
        input_bio: formData.bio || null
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Profile updated successfully!');
        loadProfile(); // Refresh the profile data
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Failed to load profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elegant">
      <CardHeader className="text-center space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-strong">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.name} />
              <AvatarFallback className="text-2xl font-semibold bg-gradient-primary text-primary-foreground">
                {(profile.display_name || profile.name).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 shadow-md"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {profile.display_name || profile.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                {profile.role}
              </Badge>
              <Badge variant="outline">ID: {profile.user_id}</Badge>
            </div>
            <CardDescription>
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Display Name
              </Label>
              <Input
                id="display_name"
                type="text"
                placeholder="Enter your display name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-strong transition-all duration-300"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}