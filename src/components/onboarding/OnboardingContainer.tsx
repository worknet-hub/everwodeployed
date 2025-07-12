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
    />,
    <BuildConnectionsScreen key="connections" onNext={handleNext} onPrevious={handlePrevious} />,
    <PostThoughtsScreen key="thoughts" onNext={handleNext} onPrevious={handlePrevious} />,
    <RealtimeFeaturesScreen key="realtime" onNext={handleNext} onPrevious={handlePrevious} />
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
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
