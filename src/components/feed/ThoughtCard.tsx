import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    isThoughtSaved(id).then(setSaved);
  }, [id]);

  const handleToggleSave = async () => {
    if (saved) {
      await unsaveThought(id);
      setSaved(false);
    } else {
      await saveThought(id);
      setSaved(true);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <Card className="w-full glass-card hover:glass-bright transition-all duration-500 group animate-fade-in card-hover">
      <CardContent className="p-3 md:p-6 space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Avatar className="w-9 h-9 md:w-12 md:h-12 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent transition-all duration-300 group-hover:ring-gray-400/50">
              <AvatarImage src={author.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                <User className="w-6 h-6 text-gray-300" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 md:space-y-1">
              <div className="flex items-center space-x-1 md:space-x-2">
                <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors duration-300 text-sm md:text-lg truncate md:whitespace-normal max-w-[80px] md:max-w-none">{author.username && author.username.trim() !== '' ? author.username : 'Anonymous'}</h3>
                <span className="hidden md:inline">
                  {author.verified && (
                    <Verified className="w-4 h-4 text-white fill-current animate-pulse-glow" />
                  )}
                </span>
              </div>
              <p className="hidden md:block text-xs text-gray-300 group-hover:text-gray-200 transition-colors">{author.college}</p>
              <p className="text-[10px] md:text-xs text-gray-400 group-hover:text-gray-300 transition-colors truncate md:whitespace-normal max-w-[80px] md:max-w-none">{timestamp}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleSave}
              className={`w-8 h-8 glass hover:glass-bright transition-all duration-300 hover:scale-110 ${
                saved ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
              aria-label={saved ? "Unsave Thought" : "Save Thought"}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 glass hover:glass-bright text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 md:space-y-4">
          <p className="text-white leading-relaxed group-hover:text-gray-100 transition-colors text-sm md:text-lg break-words line-clamp-3 md:line-clamp-none">{content}</p>
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
