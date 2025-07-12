
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👎', '🎉', '🔥', '💯'];

export const EmojiPicker = ({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>React with emoji</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-2 p-4">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onEmojiSelect(emoji)}
              className="text-2xl p-2 rounded hover:bg-gray-100 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
