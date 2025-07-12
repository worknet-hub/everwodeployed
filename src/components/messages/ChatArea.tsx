import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { ConnectionWarning } from './ConnectionWarning';
import { ReplyPreview } from './ReplyPreview';
import { Message, Conversation } from '@/types/messages';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatAreaProps {
  selectedConversation: string | null;
  selectedUser: Conversation | undefined;
  messages: Message[];
  newMessage: string;
  currentUserId?: string;
  isConnected: boolean;
  replyingTo: Message | null;
  onNewMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onCancelReply: () => void;
}

export const ChatArea = ({
  selectedConversation,
  selectedUser,
  messages,
  newMessage,
  currentUserId,
  isConnected,
  replyingTo,
  onNewMessageChange,
  onSendMessage,
  onReply,
  onReact,
  onCancelReply
}: ChatAreaProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Ref for the scrollable messages area
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll only the messages area to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300 bg-[rgba(0,0,0,0.7)]">
        <div className="text-center">
          <p className="mb-4">Select a conversation to start messaging</p>
          <Button 
            onClick={() => navigate('/connections')}
            variant="outline"
            className="flex items-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <UserPlus className="w-4 h-4" />
            Find people to connect with
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[rgba(0,0,0,0.7)]">
      {/* Desktop back icon */}
      {!isMobile && (
        <div className="flex items-center h-16 px-4 bg-black/80 sticky top-0 z-50">
          <div className="flex-1" />
        </div>
      )}
      {/* Desktop header (if any) */}
      {!isMobile && (
        <div className="relative z-30">
          <ChatHeader
            userName={selectedUser?.full_name || 'Unknown User'}
            userAvatar={selectedUser?.avatar_url || ''}
            isConnected={isConnected}
          />
        </div>
      )}

      {!isConnected && <ConnectionWarning />}

      {/* Make only the messages area scrollable */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pb-0" ref={messagesContainerRef}>
          <MessagesList
            messages={messages}
            currentUserId={currentUserId}
            partnerId={selectedConversation}
            onReply={onReply}
            onReact={onReact}
          />
          <div ref={messagesEndRef} />
        </div>
        {replyingTo && (
          <ReplyPreview
            replyingTo={replyingTo}
            onCancel={onCancelReply}
          />
        )}
        {/* Message input area, no extra background wrapper */}
        <MessageInput
          newMessage={newMessage}
          setNewMessage={onNewMessageChange}
          onSendMessage={onSendMessage}
          isConnected={isConnected}
        />
        {/* Black area below message input on mobile */}
        <div className="bg-black w-full h-6 md:hidden" />
      </div>
    </div>
  );
};
