
import { ProfilePage as ProfilePageComponent } from '@/components/profile/ProfilePage';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { userId } = useParams();
  console.log('userId from URL:', userId);
  return (
    <div data-tour="profile">
      <ProfilePageComponent userId={userId} />
    </div>
  );
};

export default ProfilePage;
