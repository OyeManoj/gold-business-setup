import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Receipt, Building2, MapPin } from 'lucide-react';
import { ReceiptSettings } from '@/types/receiptSettings';
import { getReceiptSettings, saveReceiptSettings } from '@/utils/receiptSettingsStorage';
import { toast } from '@/hooks/use-toast';

interface ReceiptSettingsProps {
  language: string;
}

export function ReceiptSettingsComponent({ language }: ReceiptSettingsProps) {
  const [settings, setSettings] = useState<ReceiptSettings>({
    showBusinessName: true,
    showBusinessAddress: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getReceiptSettings();
      setSettings(savedSettings);
    };
    loadSettings();
  }, []);

  const handleSettingChange = async (key: keyof ReceiptSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await saveReceiptSettings(newSettings);
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Settings Saved',
        description: language === 'ar' 
          ? 'تم حفظ إعدادات الفاتورة' 
          : 'Receipt settings have been saved',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في حفظ الإعدادات' 
          : 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'إعدادات الفاتورة' : 'Receipt Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'اختر تفاصيل العمل التي تريد إظهارها في الفواتير:' 
              : 'Choose which business details to display on receipts:'}
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="business-name" className="flex items-center gap-2 cursor-pointer">
                <Building2 className="h-4 w-4" />
                {language === 'ar' ? 'اسم العمل' : 'Business Name'}
              </Label>
              <Switch
                id="business-name"
                checked={settings.showBusinessName}
                onCheckedChange={(checked) => handleSettingChange('showBusinessName', checked)}
              />
            </div>


            <div className="flex items-center justify-between">
              <Label htmlFor="business-address" className="flex items-center gap-2 cursor-pointer">
                <MapPin className="h-4 w-4" />
                {language === 'ar' ? 'العنوان' : 'Address'}
              </Label>
              <Switch
                id="business-address"
                checked={settings.showBusinessAddress}
                onCheckedChange={(checked) => handleSettingChange('showBusinessAddress', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}