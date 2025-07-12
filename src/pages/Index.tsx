import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnhancedThoughtsFeed } from '@/components/feed/EnhancedThoughtsFeed';
import { EnhancedThoughtComposer } from '@/components/feed/EnhancedThoughtComposer';
import QuickProfile from '@/components/profile/QuickProfile';
import TrendingSidebar from '@/components/sidebar/TrendingSidebar';
import PeopleYouMayKnow from '@/components/sidebar/PeopleYouMayKnow';
import { RealtimeCommunitiesList } from '@/components/communities/RealtimeCommunitiesList';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [refreshFeed, setRefreshFeed] = useState(0);
  
  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle community filtering from URL params
  useEffect(() => {
    const communityParam = searchParams.get('community');
    if (communityParam) {
      setSelectedCommunity(communityParam);
    }
  }, [searchParams]);

  const handleThoughtPosted = () => {
    setRefreshFeed(prev => prev + 1);
  };

  const handleCommunitySelect = (community: string) => {
    if (community === '') {
      setSelectedCommunity(null);
      setSearchParams({});
    } else {
      setSelectedCommunity(community);
      setSearchParams({ community });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          full_name: fullName,
          username: username,
          college_name: college
        });
        if (error) throw error;
        toast.success('Check your email to verify your account!');
        // Redirect to onboarding after signup
        navigate('/onboarding', { replace: true });
        return;
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Check if it's admin credentials even if auth fails
          if (email === 'anand01ts@gmail.com' && password === 'Anand.1105') {
            toast.success('Admin access granted!');
            return;
          }
          throw error;
        }
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgba(0,0,0,0.7)]">
        <div className="text-center">
          <p className="text-lg text-white">Loading...</p>
          <p className="text-sm text-gray-400 mt-2">Checking authentication status</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgba(0,0,0,0.7)]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Logo above Auth Form */}
            <div className="flex justify-center mb-8">
              <img src="/logo2.jpg" alt="Everwo Logo" className="h-16 w-16 rounded-2xl shadow-lg" />
            </div>
            {/* Only Auth Form, hero section removed */}
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="max-w-md w-full">
                <div className="bg-[rgba(0,0,0,0.7)] border border-[#2a2f3e] rounded-3xl p-8 shadow-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {isSignUp ? 'Join Everwo' : 'Welcome Back'}
                    </h3>
                    <p className="text-gray-400">
                      {isSignUp 
                        ? 'Start collaborating with students worldwide' 
                        : 'Start your journey with Everwo'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                                                      <Label htmlFor="username" className="text-sm font-medium text-gray-300">Username</Label>
                            <Input
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                              className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                              placeholder="Choose a username"
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="college" className="text-sm font-medium text-gray-300">College</Label>
                          <Input
                            id="college"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                            placeholder="Your college/university"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                        placeholder="Enter your password"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base rounded-xl font-medium bg-white hover:bg-gray-100 text-black" 
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-gray-400 hover:text-white"
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp 
                          ? 'Already have an account? Sign in' 
                          : "Don't have an account? Sign up"
                        }
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#000000] mobile-content">
        <div className="container mx-auto px-4 py-2 max-w-7xl">
          {selectedCommunity && (
            <div className="mb-6 flex items-center justify-between mobile-card card-dark p-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg font-semibold">Showing thoughts from:</span>
                <span className="text-white text-lg font-bold">#{selectedCommunity}</span>
              </div>
              <button
                onClick={() => handleCommunitySelect('')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Thoughts Section Heading and Divider */}
          <div className="w-full max-w-xs mt-8">
            <h2 className="text-white font-bold text-3xl md:text-4xl mb-2 text-left">
              <span className="block md:hidden">Thoughts</span>
              <span className="hidden md:block">Home</span>
            </h2>
            <div className="border-b border-white/80 h-px w-full mb-4" />
          </div>

          {/* Mobile Layout */}
          <div className="block md:hidden space-y-6">
            <ErrorBoundary>
              <div className="mobile-card">
                {/* QuickProfile hidden on mobile */}
              </div>
            </ErrorBoundary>
            <ErrorBoundary>
              <div className="mobile-card">
                <EnhancedThoughtComposer onThoughtPosted={handleThoughtPosted} />
              </div>
            </ErrorBoundary>
            <ErrorBoundary>
              <div className="mobile-card">
                <EnhancedThoughtsFeed 
                  key={`${selectedCommunity}-${refreshFeed}`}
                  communityFilter={selectedCommunity}
                />
              </div>
            </ErrorBoundary>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="col-span-1 space-y-8">
              <ErrorBoundary>
                <QuickProfile />
              </ErrorBoundary>
              <ErrorBoundary>
                <RealtimeCommunitiesList 
                  selectedCommunity={selectedCommunity}
                  onCommunitySelect={setSelectedCommunity}
                />
              </ErrorBoundary>
            </div>

            {/* Main Content */}
            <div className="col-span-2 space-y-8">
              <ErrorBoundary>
                <EnhancedThoughtComposer onThoughtPosted={handleThoughtPosted} />
              </ErrorBoundary>
              <ErrorBoundary>
                <EnhancedThoughtsFeed 
                  key={`${selectedCommunity}-${refreshFeed}`}
                  communityFilter={selectedCommunity}
                />
              </ErrorBoundary>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 space-y-8">
              <ErrorBoundary>
                <TrendingSidebar onCommunitySelect={handleCommunitySelect} />
              </ErrorBoundary>
              <ErrorBoundary>
                <PeopleYouMayKnow />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
