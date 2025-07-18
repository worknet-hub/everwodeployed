import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/messages';
import { MessageMenu } from './MessageMenu';
import { MessageReactionsList } from './MessageReactionsList';

interface MessagesListProps {
  messages: Message[];
  currentUserId?: string;
  partnerId?: string;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onLoadOlderMessages?: () => void;
  hasMoreMessages?: boolean;
  isLoadingOlder?: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: Message) => void;
}

export const MessagesList = ({ 
  messages, 
  currentUserId, 
  partnerId, 
  onReply, 
  onReact,
  onLoadOlderMessages,
  hasMoreMessages = false,
  isLoadingOlder = false,
  onDelete,
  onEdit
}: MessagesListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearTop, setIsNearTop] = useState(false);

  // Mark messages as read when they come into view
  useEffect(() => {
    if (!currentUserId || !partnerId) return;

    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.sender_id === partnerId && !msg.is_read
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', messageIds);

        if (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markMessagesAsRead();
  }, [messages, currentUserId, partnerId]);

  // Handle scroll to detect when user is near top for infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadOlderMessages) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      if (scrollTop < 100 && hasMoreMessages && !isLoadingOlder) {
        setIsNearTop(true);
        onLoadOlderMessages();
      } else {
        setIsNearTop(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onLoadOlderMessages, hasMoreMessages, isLoadingOlder]);

  return (
    <div ref={containerRef} className="space-y-4 mt-6">
      {/* Loading indicator for older messages */}
      {isLoadingOlder && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Show all messages */}
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={`flex group ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            } px-3 md:px-8`}
          >
            <div className="max-w-xs lg:max-w-md">
              {/* Reply preview */}
              {message.reply_to_message && (
                <div className={`mb-2 ${
                  message.sender_id === currentUserId ? 'text-right' : 'text-left'
                }`}>
                  <div className="bg-muted/50 border-l-2 border-primary p-2 rounded text-xs">
                    <p className="text-muted-foreground mb-1">
                      Replying to {message.reply_to_message.sender?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-foreground line-clamp-2">
                      {message.reply_to_message.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Message bubble */}
              <div className="relative">
                <div
                  className={`px-4 py-2 rounded-full ${
                    message.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } flex items-center justify-center text-center`}
                >
                  <p className="w-full">{message.content}</p>
                  <div className="flex items-center justify-end mt-1">
                    <div className="flex items-center gap-1">
                      <MessageMenu
                        message={message}
                        isOwnMessage={message.sender_id === currentUserId}
                        onReply={onReply}
                        onReact={(emoji) => onReact(message.id, emoji)}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />
                    </div>
                  </div>
                </div>
                {/* Tick and time below bubble for own messages */}
                {message.sender_id === currentUserId && (
                  <div className="flex items-center justify-between mt-1 px-2">
                    <div>
                      {message.is_read ? (
                        <CheckCheck className="w-3 h-3 text-white" />
                      ) : (
                        <Check className="w-3 h-3 opacity-50" />
                      )}
                    </div>
                    <div className="text-xs opacity-60 text-right ml-2">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                )}
                {/* Time below bubble for received messages */}
                {message.sender_id !== currentUserId && (
                  <div className="text-xs opacity-60 text-left mt-1 ml-2">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                )}
                {/* Reactions */}
                <MessageReactionsList
                  reactions={message.reactions || []}
                  onReact={(emoji) => onReact(message.id, emoji)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
