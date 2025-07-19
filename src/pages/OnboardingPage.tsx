
<<<<<<< HEAD
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

const OnboardingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && user.onboarding_completed) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || (user && user.onboarding_completed)) {
    return null;
  }

=======
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

const OnboardingPage = () => {
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
  return <OnboardingContainer />;
};

export default OnboardingPage;
