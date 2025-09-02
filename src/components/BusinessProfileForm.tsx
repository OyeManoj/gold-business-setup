import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Phone, MapPin, Save } from 'lucide-react';

interface BusinessProfile {
  name: string;
  phone?: string;
  address: string;
}

interface BusinessProfileFormProps {
  language: string;
  onProfileUpdated?: () => void;
}

export function BusinessProfileForm({ language, onProfileUpdated }: BusinessProfileFormProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.user_id) return;

      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (!error && data) {
          setProfile({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      } catch (error) {
        console.error('Error loading business profile:', error);
      }
    };

    loadProfile();
  }, [user?.user_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.user_id,
          name: profile.name,
          phone: profile.phone || null,
          address: profile.address
        });

      if (error) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'فشل في حفظ البيانات' : 'Failed to save profile',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved Successfully',
        description: language === 'ar' ? 'تم حفظ بيانات العمل بنجاح' : 'Business profile has been saved successfully.',
      });

      // Trigger refresh of app title
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ البيانات' : 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full border-2 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'ملف العمل' : 'Business Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="businessName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {language === 'ar' ? 'اسم العمل' : 'Business Name'}
            </Label>
            <Input
              id="businessName"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل اسم العمل' : 'Enter business name'}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {language === 'ar' ? 'العنوان' : 'Address'}
            </Label>
            <Textarea
              id="address"
              value={profile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل عنوان العمل' : 'Enter business address'}
              className="w-full min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full flex items-center gap-2" disabled={isLoading}>
            <Save className="h-4 w-4" />
            {isLoading 
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
              : (language === 'ar' ? 'حفظ البيانات' : 'Save Profile')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}