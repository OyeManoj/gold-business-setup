import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Gold Ease - Profile';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-card/80 backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            User Profile
          </h1>
        </div>

        <UserProfile />
      </div>
    </div>
  );
}