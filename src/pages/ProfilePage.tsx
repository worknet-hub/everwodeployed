
import { ProfilePage as ProfilePageComponent } from '@/components/profile/ProfilePage';
import { useParams } from 'react-router-dom';
import PullToRefresh from 'react-pull-to-refresh';

const ProfilePage = () => {
  const { userId } = useParams();
  const safeUserId = typeof userId === 'string' ? userId : '';
  console.log('userId from URL:', safeUserId);
  return (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="min-h-screen bg-[#000000]">
        <ProfilePageComponent userId={safeUserId} />
      </div>
    </PullToRefresh>
  );
};

export default ProfilePage;
