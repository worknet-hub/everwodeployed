
import { ProfilePage as ProfilePageComponent } from '@/components/profile/ProfilePage';
import { useParams } from 'react-router-dom';
import PullToRefresh from 'react-pull-to-refresh';

const ProfilePage = () => {
  const { profileId } = useParams();
  const safeProfileId = typeof profileId === 'string' ? profileId : '';
  console.log('profileId from URL:', safeProfileId);
  return (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="min-h-screen bg-[#000000]">
        <ProfilePageComponent profileId={safeProfileId} />
      </div>
    </PullToRefresh>
  );
};

export default ProfilePage;
