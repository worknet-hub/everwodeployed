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
import { useRealtimeProfile } from "@/contexts/RealtimeProfileContext";
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
  const { profiles, connections } = useRealtimeProfile();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = !userId || userId === user?.id;
  const profileId = userId || user?.id;

  // Find the profile from context
  const profile = profiles?.find((p: any) => p.id === profileId) || null;

  const handleAvatarChange = (newAvatarUrl: string) => {
    // Optionally update avatar locally for instant UI feedback
    // Real-time update will come from context
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <img src="/logo.png" alt="Loading..." className="w-48 h-48 object-contain animate-pulse" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
      </div>
    );
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

      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-24">
        {/* Header */}
        <Card className="shadow-none border-0">
          <CardContent className="p-8">
            <ProfileHeader 
              profile={profile} 
              isOwnProfile={isOwnProfile} 
              onEditClick={() => setShowEditModal(true)}
              onAvatarChange={isOwnProfile ? handleAvatarChange : undefined}
              connections={connections}
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
          onProfileUpdated={() => {}}
        />
      </div>
    </div>
  );
};
