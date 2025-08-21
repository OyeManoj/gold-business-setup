import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { BusinessProfile } from '@/types/business';
import { getBusinessProfile, saveBusinessProfile } from '@/utils/businessStorage';
import { Building2, Phone, MapPin, Save } from 'lucide-react';

interface BusinessProfileFormProps {
  language: string;
}

export function BusinessProfileForm({ language }: BusinessProfileFormProps) {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    address: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = await getBusinessProfile();
      setProfile(savedProfile);
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBusinessProfile(profile);
    toast({
      title: language === 'ar' ? 'تم الحفظ' : 'Saved Successfully',
      description: language === 'ar' ? 'تم حفظ بيانات العمل بنجاح' : 'Business profile has been saved successfully.',
    });
  };

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'ملف العمل' : 'Business Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
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
            />
          </div>


          <div className="space-y-2">
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

          <Button type="submit" className="w-full flex items-center gap-2">
            <Save className="h-4 w-4" />
            {language === 'ar' ? 'حفظ البيانات' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}