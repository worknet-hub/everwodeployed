import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isConnected: boolean;
}

export const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  isConnected 
}: MessageInputProps) => {
  return (
    <div className="border-t mb-4 md:mb-0">
      <div className="flex space-x-2">
        <Input
          placeholder={isConnected ? "Type a message..." : "Connect with this user to send messages..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && isConnected && onSendMessage()}
          className="flex-1 h-14 text-base py-3 bg-black/60 text-white placeholder-gray-400 rounded-full border-none outline-none focus:outline-none shadow-none"
          disabled={!isConnected}
        />
        <Button onClick={onSendMessage} disabled={!isConnected} className="h-14 rounded-full bg-black/60 backdrop-blur-md shadow-none outline-none focus:outline-none border-none">
          <Send className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );
};
