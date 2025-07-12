
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Reply, Flag, Smile } from 'lucide-react';
import { Message } from '@/types/messages';
import { ReportModal } from './ReportModal';
import { EmojiPicker } from './EmojiPicker';

interface MessageMenuProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export const MessageMenu = ({ message, isOwnMessage, onReply, onReact }: MessageMenuProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEmojiPicker(true)}>
            <Smile className="h-4 w-4 mr-2" />
            React
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReply(message)}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </DropdownMenuItem>
          {!isOwnMessage && (
            <DropdownMenuItem onClick={() => setShowReportModal(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={(emoji) => {
          onReact(message.id, emoji);
          setShowEmojiPicker(false);
        }}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        message={message}
      />
    </>
  );
};
