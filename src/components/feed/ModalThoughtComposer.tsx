import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MentionInput } from './MentionInput';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';

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
    if (!content.trim() || !user) return;

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
        parent_id: parentId || null
      };

      const { error } = await supabase
        .from('thoughts')
        .insert(thoughtData);

      if (error) {
        toast.error('Failed to post thought: ' + error.message);
        return;
      }

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
      <div className="modal-content">
        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
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

            <MentionInput
              value={content}
              onChange={handleContentChange}
              placeholder={placeholder}
              className="min-h-[120px] resize-none w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/5 text-white placeholder-gray-400"
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {content.length}/500 characters
                {mentions.length > 0 && ` • ${mentions.length} mention${mentions.length > 1 ? 's' : ''}`}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/20 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePost} 
                  disabled={!content.trim() || isPosting}
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
