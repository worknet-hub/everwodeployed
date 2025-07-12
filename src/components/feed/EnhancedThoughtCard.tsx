import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, User, Hash, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EnhancedThoughtComposer } from './EnhancedThoughtComposer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React from 'react';

interface Author {
  name: string;
  avatar: string;
  college: string;
  verified: boolean;
  username?: string;
}

interface Mention {
  id: string;
  name: string;
  type: 'person' | 'community';
  start: number;
  end: number;
}

interface EnhancedThoughtCardProps {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  comments: number;
  tags?: string[];
  image?: string;
  mentions?: Mention[];
  communityName?: string;
  replies?: any[];
  onReplyPosted: () => void;
  userId?: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

export const EnhancedThoughtCard = ({
  id,
  content,
  author,
  timestamp,
  likes,
  comments,
  tags = [],
  image,
  mentions = [],
  communityName,
  replies = [],
  onReplyPosted,
  userId,
  isLiked = false,
  onToggleLike
}: EnhancedThoughtCardProps) => {
  const { user } = useAuth();
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const renderContentWithMentions = (text: string, mentions: Mention[]) => {
    if (!mentions.length) return text;

    let result = [];
    let lastIndex = 0;

    mentions.forEach((mention, index) => {
      // Add text before mention
      if (mention.start > lastIndex) {
        result.push(text.slice(lastIndex, mention.start));
      }

      // Add mention as badge
      result.push(
        <Badge 
          key={`mention-${index}`} 
          variant="secondary" 
          className="mx-1 inline-flex items-center space-x-1"
        >
          {mention.type === 'person' ? <User className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
          <span>@{mention.name}</span>
        </Badge>
      );

      lastIndex = mention.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  const handleReplyPosted = () => {
    setShowReplyComposer(false);
    onReplyPosted();
  };

  const handleDeleteThought = async () => {
    if (!user || userId !== user.id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete thought');
        return;
      }

      toast.success('Thought deleted successfully');
      onReplyPosted(); // Refresh the feed
    } catch (error) {
      toast.error('Failed to delete thought');
      console.error('Error deleting thought:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user && userId === user.id;

  return (
    <Card className="glass-card hover:shadow-lg transition-shadow relative">
      <CardContent className="p-4 md:p-6 pb-6">
        <div className="flex items-start space-x-3 md:space-x-4">
          <Avatar className="w-10 h-10 md:w-12 md:h-12">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>
              <User className="w-6 h-6 text-gray-300" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-foreground text-sm md:text-base">{author.username && author.username.trim() !== '' ? author.username : 'Anonymous'}</h4>
                {author.college && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/60 text-white text-xs font-medium shadow-sm" style={{backdropFilter: 'blur(2px)'}}>
                    {author.college}
                  </span>
                )}
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={handleDeleteThought}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {communityName && (
              <Badge variant="outline" className="text-xs">
                <Hash className="w-3 h-3 mr-1" />
                {communityName}
              </Badge>
            )}

            <p className="text-foreground leading-relaxed text-sm md:text-base">
              {renderContentWithMentions(content, mentions)}
            </p>

            {image && (
              <img 
                src={image} 
                alt="Thought image" 
                className="rounded-lg max-w-full h-auto"
              />
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 md:gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
                onClick={onToggleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2"
                onClick={() => setShowReplyComposer(!showReplyComposer)}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{comments}</span>
              </Button>

              {replies.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? 'Hide' : 'Show'} {replies.length} replies
                </Button>
              )}
            </div>

            {/* Timestamp at the absolute bottom left */}
            <span className="absolute left-4 bottom-2 text-[10px] text-muted-foreground">{timestamp}</span>

            {showReplyComposer && (
              <div className="mt-4">
                <EnhancedThoughtComposer
                  parentId={id}
                  placeholder="Write a reply..."
                  onThoughtPosted={handleReplyPosted}
                />
              </div>
            )}

            {showReplies && replies.length > 0 && (
              <div className="mt-4 space-y-4 border-l-2 border-muted pl-4 md:border-l-2 md:pl-4 bg-background/80 rounded-lg p-2 md:bg-transparent md:rounded-none md:p-0 overflow-x-auto">
                {replies.map((reply) => (
                  <React.Fragment key={reply.id}>
                    <div className="block md:hidden border border-white/10 rounded-lg bg-background/90 p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={reply.user.avatar} />
                          <AvatarFallback>
                            <User className="w-4 h-4 text-gray-300" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-xs text-white">{reply.user.name}</span>
                        <span className="text-[10px] text-gray-400">{reply.created_at}</span>
                      </div>
                      <div className="text-xs text-white mb-2">{reply.content}</div>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-gray-300 text-xs"><Heart className="w-4 h-4 mr-1" />{reply.likes_count || 0}</span>
                        <span className="flex items-center text-gray-300 text-xs"><MessageCircle className="w-4 h-4 mr-1" />{reply.comments_count || 0}</span>
                      </div>
                    </div>
                    <span className="hidden md:block">
                      <EnhancedThoughtCard
                        id={reply.id}
                        content={reply.content}
                        author={reply.user}
                        timestamp={reply.created_at}
                        likes={reply.likes_count || 0}
                        comments={reply.comments_count || 0}
                        mentions={reply.mentions || []}
                        onReplyPosted={onReplyPosted}
                        userId={reply.user_id}
                      />
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
