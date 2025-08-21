import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BusinessProfileForm } from '@/components/BusinessProfileForm';
import { ReceiptSettingsComponent } from '@/components/ReceiptSettings';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { ArrowLeft } from 'lucide-react';

const BusinessProfile = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'ملف العمل' : 'Business Profile'}
            </h1>
          </div>
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Business Profile Form */}
        <div className="space-y-8">
          <BusinessProfileForm language={language} />
          <ReceiptSettingsComponent language={language} />
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;