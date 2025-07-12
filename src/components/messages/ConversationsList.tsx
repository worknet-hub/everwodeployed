
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  partner_id: string;
  full_name: string;
  avatar_url: string;
  last_message_content: string;
  last_message_created_at: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (partnerId: string) => void;
}

export const ConversationsList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation 
}: ConversationsListProps) => {
  const navigate = useNavigate();

  return (
    <ScrollArea className="h-[calc(100vh-144px)]">
      {conversations.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-muted-foreground mb-4">No conversations yet.</p>
          <Button 
            onClick={() => navigate('/connections')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Find connections
          </Button>
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.partner_id}
            className={`p-4 cursor-pointer hover:bg-muted/50 ${
              selectedConversation === conversation.partner_id ? 'bg-muted' : ''
            }`}
            onClick={() => onSelectConversation(conversation.partner_id)}
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={conversation.avatar_url} />
                <AvatarFallback>
                  <User className="w-6 h-6 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conversation.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{conversation.last_message_content}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.last_message_created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))
      )}
    </ScrollArea>
  );
};
