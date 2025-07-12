import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-muted-foreground mt-2">Checking authentication status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
              <span className="text-2xl font-bold text-primary-foreground">C</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {/* <img src="/logo.png" alt="Everwo Logo" className="h-10 w-auto mx-auto" /> */}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/lovable-uploads/2b8f460b-0176-4a5b-999c-6b47215807c3.png"
                  alt="Students collaborating on technology projects"
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
              
                  
                </div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-[rgba(0,0,0,0.7)] border rounded-2xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-xs text-muted-foreground">Active Students</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-[rgba(0,0,0,0.7)] border rounded-2xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-xs text-muted-foreground">Projects Created</div>
                </div>
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="order-1 lg:order-2">
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="bg-[rgba(0,0,0,0.7)] border rounded-3xl p-8 shadow-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {isSignUp ? 'Join Everwo' : 'Welcome Back'}
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
    </div>
  );
};

export default AuthPage;
