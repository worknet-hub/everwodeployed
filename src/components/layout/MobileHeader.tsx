import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  MessageCircle, 
  Users, 
  Bell, 
  User,
  Settings,
  LogOut,
  Briefcase
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  // Remove useEffect and hidden state

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    setIsOpen(false);
  };

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Connections', path: '/connections', icon: Users },
    { name: 'View Communities', path: '/communities', icon: Briefcase },
  ];

  const userMenu = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden sticky top-0 z-50 header-dark mobile-header bg-[#000000]">
      <div className="flex items-center justify-between">
        {/* Logo - Removed */}
        <Link to="/" className="flex items-center">
          <Home className="w-3 h-3 text-black" />
        </Link>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 text-gray-400 hover:text-white hover:bg-[#2a2f3e] relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-14 w-14 text-gray-400 hover:text-white hover:bg-[#2a2f3e]">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black/80 backdrop-blur-md border-none mobile-sidebar">
              <div className="flex flex-col h-full">
                {/* User Profile Section */}
                {user && (
                  <div className="flex items-center space-x-3 pb-6">
                    {/* Avatar removed as per request */}
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.email?.split('@')[0]}</p>
                      <p className="text-sm text-gray-400">Student</p>
                    </div>
                  </div>
                )}

                <Separator className="mb-6 bg-[#2a2f3e]" />

                {/* Navigation */}
                <div className="flex-1 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-white text-black'
                          : 'text-gray-300 hover:text-white hover:bg-[#2a2f3e]'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  <Separator className="my-6 bg-[#2a2f3e]" />

                  {userMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2f3e] transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Sign Out */}
                {user && (
                  <div className="pt-6 border-t border-[#2a2f3e]">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
