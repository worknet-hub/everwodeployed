import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ChatHeaderProps {
  userName: string;
  userAvatar: string;
  isConnected: boolean;
}

export const ChatHeader = ({ userName, userAvatar, isConnected }: ChatHeaderProps) => {
  // userName is expected to be username now
  return (
    <div className="h-20 min-h-[64px] flex items-center px-4 border-b-2 border-white/20 bg-black/80 sticky top-0 z-20 shadow-md">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={userAvatar} />
          <AvatarFallback>
            <User className="w-6 h-6 text-gray-300" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-white text-lg">{userName || 'unknown-user'}</h3>
          <p className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
    </div>
  );
};
