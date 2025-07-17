import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChatView } from '@/components/messages/ChatView';
import Header from '@/components/layout/Header';
import { useIsMobile } from '@/hooks/use-mobile';
import PullToRefresh from 'react-pull-to-refresh';

const MessagesPage = () => {
  return (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="min-h-screen h-screen">
        <ChatView />
      </div>
    </PullToRefresh>
  );
};

export default MessagesPage;
