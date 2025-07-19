import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MentionInput } from './MentionInput';
import { X, Image as GalleryIcon } from 'lucide-react';
import ReactDOM from 'react-dom';
import { Select } from '@/components/ui/select';

interface ModalThoughtComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onThoughtPosted: () => void;
  parentId?: string;
  placeholder?: string;
  initialContent?: string;
}

export const ModalThoughtComposer = ({ 
  isOpen, 
  onClose, 
  onThoughtPosted, 
  parentId, 
  placeholder = "What's on your mind?",
  initialContent = ''
}: ModalThoughtComposerProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [mentions, setMentions] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
<<<<<<< HEAD
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'uni'>('public');
=======
  const [visibility, setVisibility] = useState<'public' | 'connections'>('public');
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807

  // Load draft from localStorage on mount
  useEffect(() => {
    if (isOpen && !initialContent) {
      const draft = localStorage.getItem('thoughtDraft');
      if (draft) {
        setContent(draft);
      }
    }
  }, [isOpen, initialContent]);

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    if (content && content !== initialContent) {
      localStorage.setItem('thoughtDraft', content);
    }
  }, [content, initialContent]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handlePost = async () => {
<<<<<<< HEAD
    if (!content.trim() || !user || content.length > 500) return;
=======
    if (!content.trim() || !user) return;
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807

    setIsPosting(true);
    try {
      // Find community mentions
      const communityMentions = mentions.filter(m => m.type === 'community');
      let communityId = null;

      if (communityMentions.length > 0) {
        // Use the first community mention
        const communityMention = communityMentions[0];
        
        // If it's a new community (starts with create-), create it
        if (communityMention.id.startsWith('create-')) {
          const { data: newCommunityId, error } = await supabase.rpc('create_community_if_not_exists', {
            community_name: communityMention.name,
            creator_id: user.id
          });
          
          if (!error && newCommunityId) {
            communityId = newCommunityId;
          }
        } else {
          // Use existing community ID
          communityId = communityMention.id;
        }
      }

      const thoughtData: any = {
        content,
        user_id: user.id,
        mentions: mentions,
        community_id: communityId,
        parent_id: parentId || null,
        visibility,
      };

      const { data: inserted, error } = await supabase
        .from('thoughts')
        .insert(thoughtData)
        .select('*')
        .single();

      if (error) {
        toast.error('Failed to post thought: ' + error.message);
        return;
      }

      // --- Notification logic ---
      const username = user.user_metadata?.username || user.user_metadata?.full_name || user.email || 'Someone';
      // If this is a reply (comment), notify the parent thought's author
      if (parentId) {
        // Fetch parent thought to get author
        const { data: parentThought } = await supabase
          .from('thoughts')
          .select('user_id')
          .eq('id', parentId)
          .single();
        if (parentThought && parentThought.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: parentThought.user_id,
            type: 'comment',
            title: 'New Comment',
            content: `@${username} commented on your thought: "${content.slice(0, 50)}"`,
            link: `/thought/${parentId}`,
            is_read: false
          });
        }
      }
      // Mentions: notify each mentioned user (excluding self and parent author)
      const mentionedUserIds = mentions
        .filter(m => m.type === 'person' && m.id !== user.id)
        .map(m => m.id);
      // Remove duplicates
      const uniqueMentionedUserIds = [...new Set(mentionedUserIds)];
      for (const mentionedId of uniqueMentionedUserIds) {
        await supabase.from('notifications').insert({
          user_id: mentionedId,
          type: 'mention',
          title: 'Mention',
          content: `@${username} mentioned you in a thought`,
          link: `/thought/${inserted?.id || parentId || ''}`,
          is_read: false
        });
      }
      // --- End notification logic ---

      setContent('');
      setMentions([]);
      localStorage.removeItem('thoughtDraft'); // Clear draft after successful post
      toast.success(parentId ? 'Reply posted successfully!' : 'Thought posted successfully!');
      onThoughtPosted();
      onClose();
    } catch (error) {
      toast.error('Failed to post thought');
      console.error('Error posting thought:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleContentChange = (newContent: string, newMentions: any[]) => {
    setContent(newContent);
    setMentions(newMentions);
  };

  const handleClose = () => {
    // Save draft before closing if there's content
    if (content.trim()) {
      localStorage.setItem('thoughtDraft', content);
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content max-w-md w-full mx-auto">
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {parentId ? 'Write a reply' : 'Share your thoughts'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="visibility" className="text-sm font-medium text-white">Visibility:</label>
              <select
                id="visibility"
                value={visibility}
<<<<<<< HEAD
                onChange={e => setVisibility(e.target.value as 'public' | 'connections' | 'uni')}
=======
                onChange={e => setVisibility(e.target.value as 'public' | 'connections')}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                className="custom-select rounded-full px-3 py-1 border border-white/20 focus:outline-none backdrop-blur-sm"
              >
                <option value="public">Everyone</option>
                <option value="connections">Connections only</option>
<<<<<<< HEAD
                <option value="uni">Uni-only</option>
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
              </select>
            </div>

            <div className="relative">
              <MentionInput
                value={content}
                onChange={handleContentChange}
                placeholder={placeholder}
                className="min-h-[120px] resize-none w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/5 text-white placeholder-gray-400 pr-14" // Add right padding for button
              />
              {/* Circular media button inside the typing box at the right bottom */}
              <button
                type="button"
                className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 transition-colors border border-white/10 shadow-lg focus:outline-none"
                title="Add media"
                style={{ zIndex: 10 }}
              >
                <GalleryIcon className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-400 flex-1">
                {content.length}/500 characters
                {mentions.length > 0 && ` • ${mentions.length > 1 ? 's' : ''}`}
<<<<<<< HEAD
                {content.length > 500 && (
                  <span className="text-red-400 ml-2">Too long! Max 500 characters.</span>
                )}
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
              </span>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/20 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePost} 
<<<<<<< HEAD
                  disabled={!content.trim() || isPosting || content.length > 500}
=======
                  disabled={!content.trim() || isPosting}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                  className="gradient-bg"
                >
                  {isPosting ? 'Posting...' : (parentId ? 'Reply' : 'Post')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};
