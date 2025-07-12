import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AlumniAuthPage from "./pages/AlumniAuthPage";
import AlumniPortalPage from "./pages/AlumniPortalPage";
import OnboardingPage from "./pages/OnboardingPage";
import { SearchPage } from "./components/search/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import JobHousePage from "./pages/JobHousePage";
import PostJobPage from "./pages/PostJobPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import { CommunitiesPage } from "./components/communities/CommunitiesPage";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import ReviewsPage from './pages/ReviewsPage';
import { useIsMobile } from "@/hooks/use-mobile";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from 'react';
import { supabase } from './integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { ArrowLeft } from 'lucide-react';
import NoCommunitiesPage from './pages/NoCommunitiesPage';

const queryClient = new QueryClient();

// RequireOnboarding wrapper
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      setOnboardingCompleted(profile?.onboarding_completed ?? false);
      setChecking(false);
    };
    if (!loading) checkOnboarding();
  }, [user, loading]);

  useEffect(() => {
    if (checking) return;
    if (!user) return;
    if (onboardingCompleted === false && location.pathname !== '/onboarding' && location.pathname !== '/auth') {
      navigate('/onboarding', { replace: true });
    }
  }, [checking, onboardingCompleted, user, location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgba(0,0,0,0.7)]">
        <div className="text-center text-white">Checking onboarding status...</div>
      </div>
    );
  }
  return <>{children}</>;
}

const AppRoutes = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <RequireOnboarding>
      <div className="min-h-screen bg-[rgba(0,0,0,0.7)] md:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/alumni-auth" element={<AlumniAuthPage />} />
              <Route path="/alumni-portal" element={<AlumniPortalPage />} />
              <Route path="/search" element={<SearchPage />} />
              {!isMobile && <Route path="/job-house" element={<JobHousePage />} />}
              <Route path="/post-job" element={<PostJobPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/notifications" element={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg">
                  <div className="relative w-full max-w-md mx-auto rounded-2xl border border-white/20 bg-black/80 shadow-xl backdrop-blur-lg">
                    <button
                      onClick={() => navigate(-1)}
                      className="absolute top-2 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="p-4 pt-12">
                      <NotificationsPanel />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/no-communities" element={<NoCommunitiesPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
      {location.pathname !== "/messages" && <MobileBottomNav />}
          </div>
    </RequireOnboarding>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
