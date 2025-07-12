import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  ArrowLeft
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { ProfileHeader } from './ProfileHeader';
import { ProfileOverviewTab } from './ProfileOverviewTab';
import { useRealtime } from '@/hooks/useRealtime';
import SavedThoughtsList from './SavedThoughtsList';
import UserThoughtsList from './UserThoughtsList';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  college_verified: boolean;
  skills: string[];
  portfolio: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
  created_at: string;
  available: boolean;
  college: string;
  interests: string[];
}

interface ProfilePageProps {
  userId?: string;
}

export const ProfilePage = ({ userId }: ProfilePageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = !userId || userId === user?.id;
  const profileId = userId || user?.id;

  const fetchProfile = async () => {
    if (!profileId) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileData) {
      const formattedProfile: Profile = {
        id: profileData.id,
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        avatar_url: profileData.avatar_url || '',
        bio: profileData.bio || '',
        college_name: profileData.college_name || '',
        college_verified: profileData.college_verified || false,
        skills: profileData.skills || [],
        portfolio: profileData.portfolio || [],
        rating: profileData.rating || 0,
        location: profileData.location || '',
        availability_status: profileData.availability_status || 'available',
        badges: profileData.badges || [],
        created_at: profileData.created_at || '',
        available: profileData.availability_status === 'available',
        college: profileData.college_name || '',
        interests: profileData.interests || [],
      };
      setProfile(formattedProfile);
    }
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: newAvatarUrl
      });
    }
  };

  // Use real-time updates for profile data
  useRealtime({
    table: 'profiles',
    filter: profileId ? `id=eq.${profileId}` : undefined,
    onUpdate: fetchProfile
  });

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  if (!profile) {
    return <div className="p-6">Loading profile...</div>;
  }

  const tabs = ['overview', 'thoughts'];
  if (isOwnProfile) tabs.push('saved');

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-34 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity">
              {/* <img src="/logo.png" alt="Everwo Logo" className="w-32 h-32 object-contain" /> */}
              {/* <span>Everwo</span> */}
            </Link>
          </div>
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="shadow-none border-0">
          <CardContent className="p-8">
            <ProfileHeader 
              profile={profile} 
              isOwnProfile={isOwnProfile} 
              onEditClick={() => setShowEditModal(true)}
              onAvatarChange={isOwnProfile ? handleAvatarChange : undefined}
            />
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full grid-cols-${isOwnProfile ? '3' : '2'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="thoughts">Thoughts</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="saved">Saved</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProfileOverviewTab profile={profile} isOwnProfile={isOwnProfile} />
          </TabsContent>

          <TabsContent value="thoughts" className="space-y-6">
            <UserThoughtsList userId={profile.id} />
          </TabsContent>

         {isOwnProfile && (
           <TabsContent value="saved" className="space-y-6">
             <SavedThoughtsList userId={profile.id} />
           </TabsContent>
         )}
        </Tabs>

        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onProfileUpdated={fetchProfile}
        />
      </div>
    </div>
  );
};
