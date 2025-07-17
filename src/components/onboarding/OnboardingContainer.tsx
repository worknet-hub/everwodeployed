import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { BuildConnectionsScreen } from './screens/BuildConnectionsScreen';
import { PostThoughtsScreen } from './screens/PostThoughtsScreen';
import { RealtimeFeaturesScreen } from './screens/RealtimeFeaturesScreen';
import { PersonalizeScreen } from './screens/PersonalizeScreen';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

export const OnboardingContainer = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    college_name: '',
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
    location: '',
    year_of_study: '',
    major: '',
    theme: 'dark' as 'dark' | 'light'
  });

  const totalSteps = 4;
  const isMobile = useIsMobile();
  const [showPWADialog, setShowPWADialog] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    // Always fetch and set onboardingData from backend profile on mount
    const checkProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setOnboardingData({
            college_name: profile.college_name || '',
            bio: profile.bio || '',
            skills: profile.skills || [],
            interests: profile.interests || [],
            location: profile.location || '',
            year_of_study: profile.year_of_study || '',
            major: profile.major || '',
            theme: 'dark'
          });
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };
    checkProfile();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isMobile && !localStorage.getItem('pwaDialogDismissed')) {
      setShowPWADialog(true);
    }
  }, [isMobile]);

  const handleDismissPWADialog = () => {
    setShowPWADialog(false);
    localStorage.setItem('pwaDialogDismissed', '1');
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    // Skipping onboarding is now disabled for new users
    toast.error('Onboarding is required for all new accounts.');
    return;
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsCompleting(true);
    try {
      const { theme, ...profileData } = onboardingData;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...profileData,
            onboarding_completed: true
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            username: user.email?.split('@')[0] || '',
            avatar_url: user.user_metadata?.avatar_url || null,
            ...profileData,
            onboarding_completed: true
          });

        if (error) throw error;
      }

      toast.success('Welcome to Everwo! 🎉');
      navigate('/');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup');
    } finally {
      setIsCompleting(false);
    }
  };

  const updateOnboardingData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const screens = [
    <PersonalizeScreen 
      key="personalize" 
      data={onboardingData}
      onUpdate={updateOnboardingData}
      onComplete={handleNext}
      onPrevious={() => {}} // No back button on first step
      onSkip={handleSkip}
      isCompleting={isCompleting}
      locked={currentStep > 0}
    />,
    <BuildConnectionsScreen key="connections" onNext={handleNext} onPrevious={handlePrevious} />,
    <PostThoughtsScreen key="thoughts" onNext={handleNext} onPrevious={handlePrevious} />,
    <RealtimeFeaturesScreen key="realtime" onNext={handleNext} onPrevious={handlePrevious} />
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Checking onboarding status...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden pb-24 md:pb-0">
      {/* PWA Recommendation Dialog */}
      <Dialog open={showPWADialog} onOpenChange={setShowPWADialog}>
        <DialogContent className="max-w-lg w-full p-0 overflow-hidden">
          <div className="relative max-h-[80vh] overflow-y-auto p-6">
            <button
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700"
              onClick={handleDismissPWADialog}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2 text-center">Prefer PWA for Best Experience</h2>
            <p className="mb-4 text-center text-gray-500">We recommend using Everwo as a Progressive Web App (PWA) for a smoother, app-like experience on your mobile device.</p>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">For iOS</h3>
              <div className="flex flex-col gap-4 items-center">
                <img src="/ios1.png" alt="iOS Step 1" className="rounded-lg border w-full max-w-xs" />
                <img src="/ios2.png" alt="iOS Step 2" className="rounded-lg border w-full max-w-xs" />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">For Android</h3>
              <div className="flex flex-col gap-4 items-center">
                <img src="/and1.jpg" alt="Android Step 1" className="rounded-lg border w-full max-w-xs" />
                <img src="/and2.jpg" alt="Android Step 2" className="rounded-lg border w-full max-w-xs" />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={handleDismissPWADialog} className="w-full max-w-xs">Got it!</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Exit (X) button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Exit onboarding"
      >
        <X className="w-6 h-6" />
      </button>
      {/* Progress indicator */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentStep
                  ? 'bg-white scale-125'
                  : index < currentStep
                  ? 'bg-gray-400'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Screen container */}
      <div className="relative w-full h-full">
        {screens[currentStep]}
      </div>
    </div>
  );
};
