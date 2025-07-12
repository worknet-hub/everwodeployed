import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import { AvatarUpload } from './AvatarUpload';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  college_verified: boolean;
  skills: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
}

const QuickProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user?.id) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      const formattedProfile: Profile = {
        id: profileData.id,
        full_name: profileData.full_name || 'Anonymous User',
        username: profileData.username || '',
        avatar_url: profileData.avatar_url || '',
        bio: profileData.bio || '',
        college_name: profileData.college_name || '',
        college_verified: profileData.college_verified || false,
        skills: profileData.skills || [],
        rating: profileData.rating || 0,
        location: profileData.location || '',
        availability_status: profileData.availability_status || 'available',
        badges: profileData.badges || []
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
    filter: user?.id ? `id=eq.${user.id}` : undefined,
    onUpdate: fetchProfile
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);



  const handleViewFullProfile = () => {
    console.log('Navigating to full profile');
    navigate('/profile');
  };



  if (!profile) {
    return (
      <Card className="bg-black border border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black text-white shadow-none border-0">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center justify-center w-full">
          <AvatarUpload
            currentAvatar={profile.avatar_url}
            userName={profile.full_name}
            onAvatarChange={handleAvatarChange}
            size="md"
          />
        </div>
        <div className="flex justify-center mt-4 mb-2">
          <div className="bg-white text-black rounded-2xl px-4 py-2 font-semibold text-base shadow border border-gray-200">
            {profile.full_name}
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 mt-2">
          <MapPin className="w-4 h-4" />
          <span>{profile.college_name || profile.location || 'Location not set'}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">


        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start bg-white/10 hover:bg-white/20 text-white"
            onClick={handleViewFullProfile}
          >
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickProfile;
