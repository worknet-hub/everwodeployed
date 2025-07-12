import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Star,
  Users,
  GraduationCap,
  Edit,
  MessageCircle,
  Verified,
  User
} from 'lucide-react';
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
  portfolio: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditClick: () => void;
  onAvatarChange?: (newAvatarUrl: string) => void;
}

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick, onAvatarChange }: ProfileHeaderProps) => {
  const displayUsername = profile.username || 'username-not-set';
  const displayLocation = profile.location || 'Location not set';
  const displayCollege = profile.college_name || 'College not set';
  const displayBio = profile.bio || 'No bio available';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
      {isOwnProfile && onAvatarChange ? (
        <AvatarUpload
          currentAvatar={profile.avatar_url}
          userName={profile.full_name || profile.username}
          onAvatarChange={onAvatarChange}
          size="lg"
        />
      ) : (
        <Avatar className="w-32 h-32">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-2xl">
            <User className="w-12 h-12 text-gray-300" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">@{displayUsername}</h1>
            {isOwnProfile && (
              <button
                onClick={onEditClick}
                className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Edit username"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
            )}
            {profile.college_verified && (
              <Verified className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex justify-start mt-2 mb-2">
            <div className="bg-white text-black rounded-xl px-2 py-1 font-semibold text-base shadow border border-gray-200">
              {profile.full_name}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{displayCollege}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground max-w-2xl">{displayBio}</p>

        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <Badge key={badge} className="bg-gradient-to-r from-white to-gray-200 text-black">
              {badge}
            </Badge>
          ))}
          {profile.badges.length === 0 && (
            <span className="text-sm text-muted-foreground">No badges yet</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row gap-2 md:flex-col md:gap-2 mt-4 md:mt-0">
        {isOwnProfile ? (
          null
        ) : (
          <>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Request
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
