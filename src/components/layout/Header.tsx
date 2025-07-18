import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, Settings, LogOut, Sun, Moon, Home, MessageCircle, Users, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { Switch } from '../ui/switch';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileHeader from './MobileHeader';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setProfileAvatar(data.avatar_url);
        });
    }
  }, [user?.id]);

  // Track scroll position
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Reviews', path: '/reviews' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleMessaging = () => {
    navigate('/messages');
  };

  // Don't show DM icon on profile pages
  const showDMIcon = !location.pathname.startsWith('/profile');

  // Show mobile header on mobile devices
  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <div className="sticky top-0 z-50">
      <header className={`bg-[#000000] animate-slide-up transition-colors duration-300 min-h-[80px] py-4`}>
        <div className="container mx-auto h-18 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center mr-6">
            {/* <img src="/logo.webp" alt="Logo" className="h-10 w-20 object-contain" loading="lazy" /> */}
            <span className="font-bold text-2xl text-white tracking-widest">EVERWO</span>
          </Link>
          {/* Center: Navigation */}
          <nav className="flex-1 flex justify-center">
            <div className="flex space-x-2">
              {navigation.map((item) => (
                <Link key={item.name} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                    size="sm"
                    className={`glass hover:glass-bright transition-all duration-300 hover:scale-105 text-white border-white/10 ${
                      location.pathname === item.path 
                        ? 'bg-white/20 text-white glow-effect' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {item.name === 'Home' ? <Home className="w-5 h-5" /> : item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
          {/* Right: User/Actions */}
          <div className="flex items-center space-x-4 justify-end">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/connections')}
                  className="glass hover:glass-bright text-white hover:text-white transition-all duration-300 hover:scale-110 glow-effect"
                  aria-label="Connections"
                >
                  <Users className="w-5 h-5" />
                </Button>
                {showDMIcon && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleMessaging}
                    className="glass hover:glass-bright text-white hover:text-white transition-all duration-300 hover:scale-110 glow-effect"
                    aria-label="Messages"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                )}
                
                {/* Notifications Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="glass hover:glass-bright text-white hover:text-white transition-all duration-300 hover:scale-110 glow-effect relative"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse-glow"></div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card border-white/20" align="end">
                    <NotificationsPanel />
                  </PopoverContent>
                </Popover>
              </>
            )}

            {user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full glass hover:glass-bright glow-effect transition-all duration-300 hover:scale-110">
                      <Avatar className="h-10 w-10 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent">
                        <AvatarImage src={profileAvatar || user?.user_metadata?.avatar_url || '/default.jpeg'} />
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-card border-white/20" align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center text-white hover:text-white transition-colors">
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} className="btn-primary">
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
