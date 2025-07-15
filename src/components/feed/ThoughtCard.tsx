import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Verified,
  Bookmark,
  BookmarkCheck,
  User
} from 'lucide-react';
import { useSavedThoughts } from '@/hooks/useSavedThoughts';
import { useRealtime } from '@/hooks/useRealtime';
import dayjs from 'dayjs';

interface ThoughtCardProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
    username?: string; // Added username to the interface
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags?: string[];
  image?: string;
}

const ThoughtCard = ({ 
  id,
  author, 
  content, 
  timestamp, 
  likes, 
  comments, 
  tags = [],
  image 
}: ThoughtCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  // Bookmark logic
  const { isThoughtSaved, saveThought, unsaveThought } = useSavedThoughts();
  const [saved, setSaved] = useState(false);
  const [pendingUnsave, setPendingUnsave] = useState(false);

  // Real-time sync for saved state
  useEffect(() => {
    let mounted = true;
    isThoughtSaved(id).then((val) => { if (mounted) setSaved(val); });
    return () => { mounted = false; };
  }, [id]);
  // Removed useRealtime subscription for saved_thoughts

  const handleToggleSave = async () => {
    if (saved) {
      setSaved(false); // Optimistic UI
      setPendingUnsave(true);
      setTimeout(async () => {
        await unsaveThought(id);
        setPendingUnsave(false);
      }, 300); // Slight latency for removal
    } else {
      setSaved(true); // Optimistic UI
      await saveThought(id);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const navigate = useNavigate();

  // Defensive fallback for author
  const safeAuthor = author || { name: 'Anonymous', avatar: '', college: '', verified: false, username: '' };

  return (
    <Card className="w-full glass-card hover:glass-bright transition-all duration-500 group animate-fade-in card-hover relative">
      {/* Bookmark icon top right */}
      <button
        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
        onClick={handleToggleSave}
        aria-label={saved ? 'Unsave thought' : 'Save thought'}
      >
        {saved ? (
          <Bookmark className="w-6 h-6 text-white fill-current" />
        ) : (
          <Bookmark className="w-6 h-6 text-white" />
        )}
      </button>
      <CardContent className="p-3 md:p-6 space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            {safeAuthor?.username && safeAuthor.username.trim() !== '' ? (
              <div className="flex items-center space-x-2 md:space-x-4 focus:outline-none">
                <div className="cursor-pointer" onClick={() => navigate(`/profile/${safeAuthor.id}`)}>
                  <Avatar className="w-9 h-9 md:w-12 md:h-12 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent transition-all duration-300 group-hover:ring-gray-400/50">
                    <AvatarImage src={safeAuthor.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                      <User className="w-6 h-6 text-gray-300" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="font-semibold text-foreground text-sm md:text-base cursor-pointer" onClick={() => navigate(`/profile/${safeAuthor.id}`)}>{safeAuthor.username}</span>
                <span className="text-[10px] md:text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{dayjs(timestamp).format('MMM DD, YYYY, hh:mm A')}</span>
              </div>
            ) : (
              <>
                <Avatar className="w-9 h-9 md:w-12 md:h-12 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent transition-all duration-300 group-hover:ring-gray-400/50">
                  <AvatarImage src={safeAuthor?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                    <User className="w-6 h-6 text-gray-300" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 md:space-y-1">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <span className="font-semibold text-white group-hover:text-gray-200 transition-colors duration-300 text-sm md:text-lg">Anonymous</span>
                    <span className="hidden md:inline">
                      {safeAuthor?.verified && (
                        <Verified className="w-4 h-4 text-white fill-current animate-pulse-glow" />
                      )}
                    </span>
                  </div>
                  <p className="hidden md:block text-xs text-gray-300 group-hover:text-gray-200 transition-colors">{safeAuthor?.college}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{dayjs(timestamp).format('MMM DD, YYYY, hh:mm A')}</p>
                </div>
              </>
            )}
          </div>
          {/* Three dots button vertically aligned with avatar, right side */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 glass hover:glass-bright text-gray-300 hover:text-white transition-all duration-300 hover:scale-110"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2 md:space-y-4">
          <div className="text-white leading-relaxed group-hover:text-gray-100 transition-colors text-sm md:text-lg break-words line-clamp-3 md:line-clamp-none">{content}</div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-0">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="glass hover:glass-bright text-white border-white/20 hover:border-gray-400/50 transition-all duration-300 hover:scale-105 cursor-pointer text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          {image && (
            <div className="rounded-xl overflow-hidden glass border border-white/10 group-hover:border-white/20 transition-all duration-300 mt-2 md:mt-0">
              <img 
                src={image} 
                alt="Thought attachment" 
                className="w-full h-40 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/10 group-hover:border-white/20 transition-colors">
          <div className="flex items-center space-x-4 md:space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 md:space-x-2 glass hover:glass-bright transition-all duration-300 hover:scale-110 ${
                isLiked ? 'text-red-400 glow-effect' : 'text-gray-300 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current animate-bounce-gentle' : ''}`} />
              <span className="text-xs md:text-sm font-medium">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white glass hover:glass-bright transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs md:text-sm font-medium">{comments}</span>
            </Button>
            <span className="hidden md:inline">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-300 hover:text-green-400 glass hover:glass-bright transition-all duration-300 hover:scale-110"
              >
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </Button>
            </span>
          </div>
          <div className="hidden md:block text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {Math.floor(Math.random() * 100) + 1} views
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThoughtCard;
