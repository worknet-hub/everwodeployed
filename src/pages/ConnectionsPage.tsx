import Header from '@/components/layout/Header';
import { ConnectionsView } from '@/components/connections/ConnectionsView';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const ConnectionsPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      console.log('User is authenticated, loading connections for:', user.id);
    } else {
      console.log('No authenticated user found');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#000000]">
      {!isMobile && <Header />}
      <main className="container mx-auto px-4 py-8 mobile-content">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Connections</h1>
          <div className="mobile-card card-dark">
            <ConnectionsView />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConnectionsPage;
