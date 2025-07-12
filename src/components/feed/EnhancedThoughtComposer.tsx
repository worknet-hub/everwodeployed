import { useState } from 'react';
import { InlineThoughtComposer } from './InlineThoughtComposer';
import { ModalThoughtComposer } from './ModalThoughtComposer';

interface EnhancedThoughtComposerProps {
  onThoughtPosted: () => void;
  parentId?: string;
  placeholder?: string;
}

export const EnhancedThoughtComposer = ({ onThoughtPosted, parentId, placeholder = "What's on your mind?" }: EnhancedThoughtComposerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('EnhancedThoughtComposer: isModalOpen =', isModalOpen);

  if (parentId) {
    return (
      <ModalThoughtComposer
        isOpen={true}
        onClose={onThoughtPosted}
        onThoughtPosted={onThoughtPosted}
        parentId={parentId}
        placeholder={placeholder}
      />
    );
  }

  const handleThoughtPosted = () => {
    setIsModalOpen(false);
    onThoughtPosted();
  };

  return (
    <>
      <InlineThoughtComposer onOpenModal={() => setIsModalOpen(true)} />
      <ModalThoughtComposer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onThoughtPosted={handleThoughtPosted}
        placeholder={placeholder}
      />
    </>
  );
};
