import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useState } from "react";

export type Language = 'en' | 'hi' | 'mr' | 'ar';

const languages = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  ar: 'العربية'
};

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cycleLanguage = () => {
    const languageKeys = Object.keys(languages) as Language[];
    const currentIndex = languageKeys.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languageKeys.length;
    onLanguageChange(languageKeys[nextIndex]);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleLanguage}
      className="flex items-center gap-2"
    >
      <Languages size={16} />
      {languages[currentLanguage]}
    </Button>
  );
}