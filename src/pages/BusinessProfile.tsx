import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BusinessProfileForm } from '@/components/BusinessProfileForm';
import { ReceiptSettingsComponent } from '@/components/ReceiptSettings';
import { LanguageToggle, Language } from '@/components/LanguageToggle';
import { useAppTitle } from '@/hooks/useAppTitle';
import { ArrowLeft } from 'lucide-react';

const BusinessProfile = () => {
  const navigate = useNavigate();
  const { refreshBusinessProfile, appTitle } = useAppTitle();
  const [language, setLanguage] = useState<Language>('en');

  // Update document title when appTitle changes
  useEffect(() => {
    document.title = `${appTitle} - Business Profile`;
  }, [appTitle]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
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
        <div className="space-y-4 md:space-y-6">
          <BusinessProfileForm language={language} onProfileUpdated={refreshBusinessProfile} />
          <ReceiptSettingsComponent language={language} />
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;