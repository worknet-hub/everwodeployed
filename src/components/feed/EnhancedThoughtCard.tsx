import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, User, Hash, Trash2, MoreHorizontal, Bookmark, BookmarkCheck, MoreVertical, Globe, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EnhancedThoughtComposer } from './EnhancedThoughtComposer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSavedThoughts } from '@/hooks/useSavedThoughts';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
// Removed: import { useRealtime } from '@/hooks/useRealtime';

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
  visibility?: 'public' | 'connections';
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
  onToggleLike,
  visibility = 'public',
}: EnhancedThoughtCardProps) => {
  const { user } = useAuth();
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { isThoughtSaved, saveThought, unsaveThought } = useSavedThoughts();
  const [saved, setSaved] = useState(false);
  const [pendingUnsave, setPendingUnsave] = useState(false);
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

  // Defensive fallback for author
  const safeAuthor = author || { name: 'Anonymous', avatar: '', college: '', verified: false, username: '' };

  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const reportDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportDropdownRef.current && !reportDropdownRef.current.contains(event.target as Node)) {
        setReportOpen(false);
      }
    }
    if (reportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reportOpen]);

  const handleReport = async () => {
    // TODO: Implement actual report logic (e.g., call API or insert report)
    toast.success('Report submitted!');
    setReportOpen(false);
    setReportReason('');
  };

  const handleLikeWithNotification = async () => {
    if (!user) return;
    // Optimistically call the like logic if provided
    if (onToggleLike) onToggleLike();
    // Only notify if the liker is not the author
    if (userId && user.id !== userId) {
      // Get username or fallback to email
      const username = user.user_metadata?.username || user.user_metadata?.full_name || user.email || 'Someone';
      // Insert notification for the author
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'like',
        title: 'New Like',
        content: `@${username} liked your thought`,
        link: `/thought/${id}`,
        is_read: false
      });
    }
  };

  return (
    <Card className="glass-card hover:shadow-lg transition-shadow relative">
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
      <CardContent className="p-4 md:p-6 pb-6 relative">
        <div className="flex items-start space-x-3 md:space-x-4">
          {safeAuthor.username && safeAuthor.username.trim() !== '' ? (
            <div className="flex items-start space-x-3 md:space-x-4 focus:outline-none">
              <div className="cursor-pointer" onClick={() => navigate(`/profile/${safeAuthor.id}`)}>
                <Avatar className="w-10 h-10 md:w-12 md:h-12">
                  <AvatarImage src={safeAuthor.avatar} />
                  <AvatarFallback>
                    <User className="w-6 h-6 text-gray-300" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="font-semibold text-foreground text-sm md:text-base cursor-pointer" onClick={() => navigate(`/profile/${safeAuthor.id}`)}>{safeAuthor.username}</span>
                    {safeAuthor.college && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/60 text-white text-xs font-medium shadow-sm" style={{backdropFilter: 'blur(2px)'}}>
                        {safeAuthor.college}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black border border-white/20 shadow-lg rounded-xl">
                        {isOwner ? (
                          <DropdownMenuItem 
                            onClick={handleDeleteThought}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setShowReasonBox(true)}
                            className="text-red-500 focus:text-red-500"
                          >
                            Report
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Report modal for non-owners */}
                {showReasonBox && !isOwner && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-black/80 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10 relative">
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                        onClick={() => setShowReasonBox(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h3 className="text-lg font-semibold text-white mb-4">Report Thought</h3>
                      <textarea
                        className="w-full rounded-lg bg-white/10 text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-400 text-sm p-3 min-h-[80px] border border-white/20 mb-4"
                        placeholder="Why are you reporting this thought? (optional)"
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        maxLength={300}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowReasonBox(false)} className="border-white/20 text-gray-300 hover:text-white">Cancel</Button>
                        <Button className="gradient-bg" onClick={handleReport}>Submit</Button>
                      </div>
                    </div>
                  </div>
                )}

                {communityName && (
                  <span className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Hash className="w-3 h-3 mr-1" />
                      {communityName}
                    </Badge>
                    {/* Visibility icon */}
                    {visibility === 'public' ? (
                      <span title="Public"><Globe className="w-4 h-4 text-blue-400" /></span>
                    ) : (
                      <span title="Connections only"><Lock className="w-4 h-4 text-yellow-400" /></span>
                    )}
                    {/* Three-dot report menu beside college name */}
                    <div className="relative">
                      <button
                        className="p-1 rounded-full hover:bg-white/10 focus:outline-none ml-1 z-20"
                        style={{ zIndex: 20 }}
                        onClick={() => setReportOpen((v) => !v)}
                        aria-label="Report options"
                      >
                        <MoreVertical className="w-6 h-6 text-white drop-shadow-[0_1px_4px_rgba(255,255,255,0.7)]" />
                      </button>
                      {reportOpen && (
                        <div
                          ref={reportDropdownRef}
                          className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg backdrop-blur bg-white/30 border border-white/20 z-50 p-3 flex flex-col gap-2"
                          style={{ minWidth: 180 }}
                        >
                          {/* Non-clickable status option */}
                          <div className="px-3 py-2 text-xs font-semibold text-gray-700/80 cursor-default select-none flex items-center gap-2">
                            {visibility === 'public' ? (
                              <Globe className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-yellow-500" />
                            )}
                            {visibility === 'public' ? 'Public' : 'Friends Only'}
                          </div>
                          <div className="h-px bg-white/30 my-1" />
                          {/* Report option */}
                          <button
                            className="w-full text-left px-3 py-2 text-xs hover:bg-white/20 rounded-lg text-red-600 font-medium"
                            onClick={() => setShowReasonBox(true)}
                          >
                            Report Thought
                          </button>
                          {showReasonBox && (
                            <textarea
                              className="w-full rounded-xl bg-white/20 text-white text-sm p-4 min-h-[60px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-300 mt-3 shadow-lg backdrop-blur"
                              placeholder="Why are you reporting this thought? (optional)"
                              value={reportReason}
                              onChange={e => setReportReason(e.target.value)}
                              maxLength={300}
                            />
                          )}
                          <div className="flex justify-end mt-2">
                            <Button size="sm" variant="outline" className="mr-2" onClick={() => setReportOpen(false)}>Cancel</Button>
                            <Button size="sm" className="gradient-bg" onClick={handleReport}>Submit</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </span>
                )}

                <div className="text-foreground leading-relaxed text-sm md:text-base">
                  {renderContentWithMentions(content, mentions)}
                </div>

                {image && (
                  <img 
                    src={image} 
                    alt="Thought image" 
                    className="rounded-lg max-w-full h-auto"
                    loading="lazy"
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
                    onClick={handleLikeWithNotification}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likes}</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2"
                    onClick={() => setIsReplying((v) => !v)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments}</span>
                  </Button>
                </div>

                {/* Inline reply dropdown and replies always shown when isReplying is true */}
                {isReplying && (
                  <>
                    <div className="mt-3 bg-black/80 border border-white/10 rounded-xl p-3 shadow-xl flex flex-col gap-2">
                      <div className="flex items-center w-full">
                        <textarea
                          className="flex-1 rounded-lg bg-white/10 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary text-xs p-2 min-h-[36px] md:text-sm md:p-3 md:min-h-[44px] border-none shadow-none"
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          maxLength={500}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <button
                          className={`flex items-center justify-center p-0 w-10 h-10 rounded-full transition-colors ml-1 ${replyContent.trim() ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                          onClick={() => {
                            if (replyContent.trim()) {
                              /* handle reply post logic here */ setIsReplying(false); setReplyContent(""); handleReplyPosted();
                            } else {
                              setIsReplying(false); setReplyContent("");
                            }
                          }}
                          aria-label={replyContent.trim() ? "Post reply" : "Cancel reply"}
                          type="button"
                          style={{ minWidth: '40px', minHeight: '40px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Always show replies under the post when isReplying is true */}
                    {replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-muted pl-4 md:border-l-2 md:pl-4 bg-background/80 rounded-lg p-2 md:bg-transparent md:rounded-none md:p-0 overflow-x-auto">
                        {replies.map((reply) => (
                          <div key={reply.id}>
                            <div className="block md:hidden border border-white/10 rounded-lg bg-background/90 p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={reply.user.avatar} />
                                  <AvatarFallback>
                                    <User className="w-4 h-4 text-gray-300" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-xs text-white">{reply.user.name}</span>
                                <span className="text-[10px] text-gray-400">{dayjs(reply.created_at).format('hh:mm A')}</span>
                                {/* Three-dot menu for comment */}
                                {user && reply.user_id === user.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ml-1"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem 
                                        onClick={async () => { await supabase.from('thoughts').delete().eq('id', reply.id); onReplyPosted(); }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <div className="text-xs text-white mb-2">{reply.content}</div>
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center text-gray-300 text-xs"><Heart className="w-4 h-4 mr-1" />{reply.likes_count || 0}</span>
                                <span className="flex items-center text-gray-300 text-xs"><MessageCircle className="w-4 h-4 mr-1" />{reply.comments_count || 0}</span>
                              </div>
                            </div>
                            <span className="hidden md:block">
                              <div className="md:mt-6 md:p-5 md:rounded-xl md:bg-background/80 md:space-y-3">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Avatar className="w-9 h-9">
                                    <AvatarImage src={reply.user.avatar} />
                                    <AvatarFallback>
                                      <User className="w-5 h-5 text-gray-300" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold md:text-base text-xs text-white">{reply.user.name}</span>
                                  <span className="text-[11px] text-gray-400">{dayjs(reply.created_at).format('hh:mm A')}</span>
                                  {/* Three-dot menu for comment */}
                                  {user && reply.user_id === user.id && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 ml-1"><MoreHorizontal className="h-4 w-4" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                          onClick={async () => { await supabase.from('thoughts').delete().eq('id', reply.id); onReplyPosted(); }}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                <div className="md:text-base text-xs text-white mb-2">{reply.content}</div>
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center text-gray-300 md:text-base text-xs"><Heart className="w-4 h-4 mr-1" />{reply.likes_count || 0}</span>
                                  <span className="flex items-center text-gray-300 md:text-base text-xs"><MessageCircle className="w-4 h-4 mr-1" />{reply.comments_count || 0}</span>
                                </div>
                              </div>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Timestamp at the absolute left bottom */}
                <span className="absolute left-4 bottom-2 text-[10px] text-muted-foreground">{dayjs(timestamp).format('MMM DD, YYYY, hh:mm A')}</span>

                {/* Friends badge for connections-only thoughts */}
                {visibility === 'connections' && (
                  <span className="absolute right-4 bottom-2 bg-green-900 text-white text-xs px-3 py-1 rounded-full shadow-md" style={{borderRadius: '12px 12px 12px 4px', background: 'linear-gradient(90deg, #14532d 80%, #166534 100%)'}}>
                    friends
                  </span>
                )}

                {showReplyComposer && (
                  <div className="mt-4">
                    <EnhancedThoughtComposer
                      parentId={id}
                      placeholder="Write a reply..."
                      onThoughtPosted={handleReplyPosted}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Avatar className="w-10 h-10 md:w-12 md:h-12">
                <AvatarImage src={safeAuthor.avatar} />
                <AvatarFallback>
                  <User className="w-6 h-6 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-foreground text-sm md:text-base">Anonymous</h4>
                    {safeAuthor.college && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/60 text-white text-xs font-medium shadow-sm" style={{backdropFilter: 'blur(2px)'}}>
                        {safeAuthor.college}
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
                  <span className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Hash className="w-3 h-3 mr-1" />
                      {communityName}
                    </Badge>
                    {/* Visibility icon */}
                    {visibility === 'public' ? (
                      <span title="Public"><Globe className="w-4 h-4 text-blue-400" /></span>
                    ) : (
                      <span title="Connections only"><Lock className="w-4 h-4 text-yellow-400" /></span>
                    )}
                    {/* Three-dot report menu beside college name */}
                    <div className="relative">
                      <button
                        className="p-1 rounded-full hover:bg-white/10 focus:outline-none ml-1 z-20"
                        style={{ zIndex: 20 }}
                        onClick={() => setReportOpen((v) => !v)}
                        aria-label="Report options"
                      >
                        <MoreVertical className="w-6 h-6 text-white drop-shadow-[0_1px_4px_rgba(255,255,255,0.7)]" />
                      </button>
                      {reportOpen && (
                        <div
                          ref={reportDropdownRef}
                          className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg backdrop-blur bg-white/30 border border-white/20 z-50 p-3 flex flex-col gap-2"
                          style={{ minWidth: 180 }}
                        >
                          {/* Non-clickable status option */}
                          <div className="px-3 py-2 text-xs font-semibold text-gray-700/80 cursor-default select-none flex items-center gap-2">
                            {visibility === 'public' ? (
                              <Globe className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-yellow-500" />
                            )}
                            {visibility === 'public' ? 'Public' : 'Friends Only'}
                          </div>
                          <div className="h-px bg-white/30 my-1" />
                          {/* Report option */}
                          <button
                            className="w-full text-left px-3 py-2 text-xs hover:bg-white/20 rounded-lg text-red-600 font-medium"
                            onClick={() => setShowReasonBox(true)}
                          >
                            Report Thought
                          </button>
                          {showReasonBox && (
                            <textarea
                              className="w-full rounded-xl bg-white/20 text-white text-sm p-4 min-h-[60px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-300 mt-3 shadow-lg backdrop-blur"
                              placeholder="Why are you reporting this thought? (optional)"
                              value={reportReason}
                              onChange={e => setReportReason(e.target.value)}
                              maxLength={300}
                            />
                          )}
                          <div className="flex justify-end mt-2">
                            <Button size="sm" variant="outline" className="mr-2" onClick={() => setReportOpen(false)}>Cancel</Button>
                            <Button size="sm" className="gradient-bg" onClick={handleReport}>Submit</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </span>
                )}

                <div className="text-foreground leading-relaxed text-sm md:text-base">
                  {renderContentWithMentions(content, mentions)}
                </div>

                {image && (
                  <img 
                    src={image} 
                    alt="Thought image" 
                    className="rounded-lg max-w-full h-auto"
                    loading="lazy"
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
                    onClick={handleLikeWithNotification}
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
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedThoughtCard;
