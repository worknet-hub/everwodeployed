
import { ProfilePage as ProfilePageComponent } from '@/components/profile/ProfilePage';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { userId } = useParams();
  const safeUserId = typeof userId === 'string' ? userId : '';
  console.log('userId from URL:', safeUserId);
  return (
    <div data-tour="profile">
      <ProfilePageComponent userId={safeUserId} />
    </div>
  );
};

export default ProfilePage;
