import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PullToRefresh from 'react-pull-to-refresh';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated - only once when user changes
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Redirecting authenticated user to home');
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

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
        // Check onboarding status before redirecting
        const { data: { user: signedUpUser } } = await supabase.auth.getUser();
        if (signedUpUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', signedUpUser.id)
            .single();
          if (profile?.onboarding_completed) {
            navigate('/', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else {
          navigate('/onboarding', { replace: true });
        }
        return;
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Check if it's admin credentials even if auth fails
          if (email === 'anand01ts@gmail.com' && password === 'Anand.1105') {
            toast.success('Admin access granted!');
            navigate('/');
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Checking authentication status...</span>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col items-center">
              <img src="/logo.webp" alt="Logo" className="w-32 h-32 object-contain mb-1.5" />
            </div>

            <div className="flex min-h-[80vh] items-center justify-center">
              <div className="max-w-md w-full">
                <div className="bg-[rgba(0,0,0,0.7)] border rounded-3xl p-8 shadow-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      EVERWO
                    </h3>
                    <p className="text-muted-foreground">
                      {isSignUp 
                        ? 'Start collaborating with students worldwide' 
                        : 'Continue your journey with us'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-11 rounded-xl"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="h-11 rounded-xl"
                            placeholder="Choose a username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="college" className="text-sm font-medium">College</Label>
                          <Input
                            id="college"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className="h-11 rounded-xl"
                            placeholder="Your college/university"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                        placeholder="Enter your password"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base rounded-xl font-medium" 
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>

                    <div className="text-center space-y-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp 
                          ? 'Already have an account? Sign in' 
                          : "Don't have an account? Sign up"
                        }
                      </Button>
                      
                      {/* Alumni Portal Section - Made more prominent */}
                      {/* Removed Alumni Portal section */}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default AuthPage;
