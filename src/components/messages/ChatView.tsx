import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConversationsSidebar } from './ConversationsSidebar';
import { ChatArea } from './ChatArea';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useConnection } from '@/hooks/useConnection';
import { useMessageRealtime } from '@/hooks/useMessageRealtime';
import { Message } from '@/types/messages';
import { ChatHeader } from './ChatHeader';
import { ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

export const ChatView = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { conversations, fetchConversations } = useConversations(user?.id);
  const { messages, setMessages, fetchMessages, sendMessage, loadOlderMessages, hasMoreMessages, isLoadingOlder, reactToMessage } = useMessages(user?.id);
  const { isConnected, checkConnection } = useConnection(user?.id);

  // Handle initial conversation selection from navigation state
  useEffect(() => {
    const state = location.state as { selectedConversation?: string };
    if (state?.selectedConversation) {
      setSelectedConversation(state.selectedConversation);
      navigate('/messages', { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (user) {
      console.log('Fetching conversations for user:', user.id);
      fetchConversations();
    } else {
      console.log('No user found, cannot fetch conversations');
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      checkConnection(selectedConversation);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages, checkConnection, setMessages]);

  // Set up real-time subscriptions
  useMessageRealtime({
    user,
    selectedConversation,
    setMessages,
    fetchConversations
  });

  const handleSendMessage = async () => {
    if (!selectedConversation) return;

    const success = await sendMessage(newMessage, selectedConversation, replyingTo?.id);
    if (success) {
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) return;
    await reactToMessage(messageId, emoji, user.id);
  };

  const handleLoadOlderMessages = () => {
    if (selectedConversation) {
      loadOlderMessages(selectedConversation);
    }
  };

<<<<<<< HEAD
  const partnerName = location.state?.partnerName;
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
  const selectedUser = conversations.find(c => c.partner_id === selectedConversation);

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-[rgba(0,0,0,0.7)]">
        {selectedConversation ? (
          <>
            <div className="flex items-center h-16 px-6 border-b border-white/10 bg-black/80 sticky top-0 z-50">
              <button
                onClick={() => setSelectedConversation(null)}
                className="flex items-center justify-center rounded-full hover:bg-white/10 transition p-2 mr-2"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              {/* Recipient info */}
<<<<<<< HEAD
              {(selectedUser || partnerName) && (
=======
              {selectedUser && (
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-3 cursor-pointer">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
<<<<<<< HEAD
                        {selectedUser?.avatar_url ? (
=======
                        {selectedUser.avatar_url ? (
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                          <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <User className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-base truncate max-w-[120px]">
<<<<<<< HEAD
                          {partnerName || selectedUser?.username || selectedUser?.full_name || 'unknown-user'}
=======
                          {selectedUser.username || selectedUser.full_name || 'unknown-user'}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                        </div>
                        <div className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Not connected'}</div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
<<<<<<< HEAD
                    <DropdownMenuItem onClick={() => navigate(`/profile/${selectedUser?.partner_id}`)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedUser?.isMuted}
=======
                    <DropdownMenuItem onClick={() => navigate(`/profile/${selectedUser.partner_id}`)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedUser.isMuted}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                      onCheckedChange={() => {}} // TODO: wire up real mute logic
                    >
                      Mute
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
<<<<<<< HEAD
                      checked={selectedUser?.readReceipt === false}
=======
                      checked={selectedUser.readReceipt === false}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                      onCheckedChange={() => {}} // TODO: wire up real read receipt logic
                    >
                      Turn off read receipt
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:bg-red-100 focus:text-red-800" onClick={() => {}}>
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex-1">
              <ChatArea
                selectedConversation={selectedConversation}
                selectedUser={selectedUser}
<<<<<<< HEAD
                userName={partnerName || selectedUser?.username || selectedUser?.full_name || 'unknown-user'}
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
                messages={messages}
                setMessages={setMessages}
                newMessage={newMessage}
                currentUserId={user?.id}
                isConnected={isConnected}
                replyingTo={replyingTo}
                onNewMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                onReply={handleReply}
                onReact={handleReact}
                onCancelReply={() => setReplyingTo(null)}
                onLoadOlderMessages={handleLoadOlderMessages}
                hasMoreMessages={hasMoreMessages}
                isLoadingOlder={isLoadingOlder}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full">
            <ConversationsSidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSelectConversation={setSelectedConversation}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-full flex bg-[rgba(0,0,0,0.7)]">
      <ConversationsSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectConversation={setSelectedConversation}
      />

      <div className="flex-1 flex flex-col">
        <ChatArea
          selectedConversation={selectedConversation}
          selectedUser={selectedUser}
<<<<<<< HEAD
          userName={partnerName || selectedUser?.username || selectedUser?.full_name || 'unknown-user'}
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
          messages={messages}
          setMessages={setMessages}
          newMessage={newMessage}
          currentUserId={user?.id}
          isConnected={isConnected}
          replyingTo={replyingTo}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onReply={handleReply}
          onReact={handleReact}
          onCancelReply={() => setReplyingTo(null)}
          onLoadOlderMessages={handleLoadOlderMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingOlder={isLoadingOlder}
        />
      </div>
    </div>
  );
};
