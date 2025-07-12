import { Home, Briefcase, MessageCircle, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  let scrollTimeout: NodeJS.Timeout | null = null;
  let lastScrollY = window.scrollY;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = window.scrollY;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setHidden(false), 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  if (!user) return null;

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'People', path: '/connections', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-black backdrop-blur-lg border-t border-white/10 animate-slide-up transition-all duration-300 mb-8",
      hidden && "translate-y-full"
    )}>
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-300 hover:scale-110",
                isActive 
                  ? "text-white glow-effect" 
                  : "text-gray-300 hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "glass-bright" : "hover:glass"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300"
                )} />
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
