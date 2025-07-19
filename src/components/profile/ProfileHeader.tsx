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
  User,
  UserCheck,
  Heart,
  MoreVertical
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingSentRequests } from '@/hooks/useConnection';
import { AvatarUpload } from './AvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';
import { useRealtimeProfile } from '@/contexts/RealtimeProfileContext';
<<<<<<< HEAD
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807

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
  connections?: any[];
  showMenuOnly?: boolean;
  hideMenu?: boolean;
}

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick, onAvatarChange, connections = [], showMenuOnly = false, hideMenu = false }: ProfileHeaderProps) => {
  if (!profile || !profile.id) return null;
  const { user } = useAuth();
  const { fetchConnections } = useRealtimeProfile();
  const [loading, setLoading] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [thoughtCount, setThoughtCount] = useState<number>(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
<<<<<<< HEAD
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const navigate = useNavigate();

  // Debug: log the avatar URL
  console.log('Profile avatar_url:', profile.avatar_url);

  const isRequested = !!(user?.id && profile?.id && connections.some(c => c.requester_id === user.id && c.addressee_id === profile.id && c.status === 'pending'));
  // Determine if this is a pending received request
  const isPendingReceived = !!(user?.id && profile?.id && connections.some(c => c.addressee_id === user.id && c.requester_id === profile.id && c.status === 'pending'));
=======

  const isRequested = !!(user?.id && profile?.id && connections.some(c => c.requester_id === user.id && c.addressee_id === profile.id && c.status === 'pending'));
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807

  // Fetch and subscribe to total likes
  useEffect(() => {
    let isMounted = true;
    async function fetchTotalLikes() {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from('thoughts')
        .select('likes_count')
        .eq('user_id', profile.id);
      if (!error && data) {
        const sum = data.reduce((acc, t) => acc + (t.likes_count || 0), 0);
        if (isMounted) setTotalLikes(sum);
      }
    }
    fetchTotalLikes();
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  // Fetch thought count (only on mount/reload)
  useEffect(() => {
    let isMounted = true;
    async function fetchThoughtCount() {
      if (!profile?.id) return;
      const { count, error } = await supabase
        .from('thoughts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .is('parent_id', null); // Only count top-level thoughts
      if (!error && typeof count === 'number' && isMounted) {
        setThoughtCount(count);
      }
    }
    fetchThoughtCount();
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setReportOpen(false);
      }
    }
    if (reportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reportOpen]);

  const handleConnectionRequest = async () => {
    if (!user?.id || !profile?.id || loading) return;

    // Prevent duplicate requests (cancel)
    if (isRequested) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('requester_id', user.id)
          .eq('addressee_id', profile.id)
          .eq('status', 'pending');
        if (error) {
          console.error('Error cancelling request:', error);
          toast.error('Failed to cancel request');
        } else {
          toast.success('Request cancelled');
          if (fetchConnections) fetchConnections();
        }
      } catch (err) {
        console.error('Error handling connection request:', err);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fetch latest connections before sending a new request
    setLoading(true);
    try {
      const { data: latestConnections, error: fetchError } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      if (fetchError) {
        toast.error('Failed to check existing connections.');
        setLoading(false);
        return;
      }
      const alreadyExists = latestConnections.some(
        c =>
          ((c.requester_id === user.id && c.addressee_id === profile.id) ||
            (c.addressee_id === user.id && c.requester_id === profile.id)) &&
          (c.status === 'pending' || c.status === 'accepted')
      );
      if (alreadyExists) {
        toast.error('A connection request already exists.');
        setLoading(false);
        return;
      }

      // Send the request
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: profile.id,
          status: 'pending'
        });
      if (error) {
        console.error('Error sending request:', error);
        toast.error('Failed to send request');
      } else {
        toast.success('Request sent!');
        if (fetchConnections) fetchConnections();
      }
    } catch (err) {
      console.error('Error handling connection request:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    // TODO: Implement report logic (e.g., call API or open modal)
    toast.success('Report submitted!');
    setReportOpen(false);
    setReportReason('');
  };

<<<<<<< HEAD
  // Remove connection handler
  const handleRemoveConnection = async () => {
    if (!user?.id || !profile?.id) return;
    setLoading(true);
    try {
      // Remove connection regardless of who sent it
      const { error } = await supabase
        .from('connections')
        .delete()
        .or(`(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),(addressee_id.eq.${user.id},requester_id.eq.${profile.id})`)
        .eq('status', 'accepted');
      if (error) {
        toast.error('Failed to remove connection');
      } else {
        toast.success('Connection removed');
        if (fetchConnections) fetchConnections();
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setShowRemoveDialog(false);
    }
  };

=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
  // Determine if users are connected (real-time)
  const isConnected = connections.some(
    c =>
      ((c.requester_id === user?.id && c.addressee_id === profile.id) ||
        (c.addressee_id === user?.id && c.requester_id === profile.id)) &&
      c.status === 'accepted'
  );

  const displayUsername = profile.username || 'username-not-set';
  const displayLocation = profile.location || 'Location not set';
  const displayCollege = profile.college_name || 'College not set';
  const displayBio = profile.bio || 'No bio available';

  if (showMenuOnly && !isOwnProfile && !hideMenu) {
    // Render only the three dots menu (for top left)
    return (
      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-white/10 focus:outline-none ml-2"
          onClick={() => setReportOpen((v) => !v)}
          aria-label="More options"
        >
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
        {reportOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 mt-2 w-80 backdrop-blur-lg bg-black/60 rounded-xl shadow-2xl p-4 z-50 border border-white/20"
            style={{ minWidth: 260 }}
          >
            <button
              className="w-full text-left text-red-600 font-semibold py-2 px-3 rounded hover:bg-red-50/30 focus:outline-none"
              onClick={() => setShowReasonBox((v) => !v)}
            >
              Report
            </button>
            {showReasonBox && (
              <textarea
                className="w-full rounded-xl bg-white/20 text-white text-sm p-4 min-h-[60px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-300 mt-3 shadow-lg backdrop-blur"
                placeholder="Why are you reporting this user? (optional)"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                maxLength={300}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative">
      {/* Left: Avatar and Stats */}
      <div className="flex flex-row md:flex-col items-center w-full md:w-auto justify-center md:justify-start">
<<<<<<< HEAD
        {/* Only show static avatar, no upload for own profile */}
        <Avatar className="w-32 h-32">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} loading="lazy" />
          ) : null}
          <AvatarFallback className="text-2xl">
            <User className="w-12 h-12 text-gray-300" />
          </AvatarFallback>
        </Avatar>
=======
        {isOwnProfile && onAvatarChange ? (
          <AvatarUpload
            currentAvatar={profile.avatar_url}
            userName={profile.full_name || profile.username}
            onAvatarChange={onAvatarChange}
            size="lg"
          />
        ) : (
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.avatar_url} loading="lazy" />
            <AvatarFallback className="text-2xl">
              <User className="w-12 h-12 text-gray-300" />
            </AvatarFallback>
          </Avatar>
        )}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
        <div className="flex flex-row items-center space-x-4 ml-4 md:ml-0 md:mt-6">
          <div className="flex flex-col items-center min-w-[36px]">
            <span className="text-lg font-bold text-white">{totalLikes}</span>
            <span className="text-xs text-gray-400 mt-1">likes</span>
          </div>
          <div className="flex flex-col items-center min-w-[36px]">
            <span className="text-lg font-bold text-white">{thoughtCount}</span>
            <span className="text-xs text-gray-400 mt-1">thoughts</span>
          </div>
        </div>
      </div>

      {/* Right: Profile Info (below avatar/stats on desktop) */}
      <div className="flex-1 space-y-4 md:mt-0 mt-4 md:ml-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{displayUsername}</h1>
            {/* Three-dot menu for reporting (desktop only) */}
            {!isOwnProfile && !hideMenu && false && (
              <div className="hidden md:block relative">
                {/* This is now handled by showMenuOnly at the top left */}
              </div>
            )}
            {isOwnProfile && (
<<<<<<< HEAD
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={onEditClick}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Edit profile"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
                <span className="text-xs text-gray-400">edit profile</span>
              </div>
=======
              <button
                onClick={onEditClick}
                className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Edit username"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
            )}
            {profile.college_verified && (
              <Verified className="w-4 h-4 md:w-6 md:h-6 text-white" />
            )}
          </div>
          {/* Remove old likes display below username */}
          <div className="flex justify-start mt-2 mb-2">
            <div className="bg-white text-black rounded-xl px-2 py-1 font-semibold text-base shadow border border-gray-200">
              {profile.full_name}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{displayCollege}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground max-w-2xl">{displayBio}</p>

        {/* Remove the stats from the badges row below */}
        <div className="flex flex-row items-end justify-between w-full mt-2 mb-2">
          <div className="flex flex-wrap gap-2 items-end min-w-[100px]">
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row gap-2 md:flex-col md:gap-2 mt-4 md:mt-0 items-center">
        {isOwnProfile ? (
          null
        ) : (
          <>
<<<<<<< HEAD
            {/* Respond button for pending received requests */}
            {isPendingReceived && !isConnected ? (
              <Button
                variant="outline"
                className="bg-gray-800 text-white border border-gray-700 hover:bg-gray-900"
                onClick={() => navigate(`/connections?focusUser=${profile.id}`)}
              >
                Respond
              </Button>
            ) : null}
            {/* Request and Message buttons if not connected and no pending request */}
            {!isConnected && !isRequested && !isPendingReceived && (
              <>
                <Button
                  variant="outline"
                  className="bg-white text-emerald-700 border border-emerald-700 rounded-lg font-semibold px-6 py-2 shadow hover:bg-emerald-50 transition-all"
                  onClick={async () => {
                    await handleConnectionRequest();
                  }}
                  disabled={loading}
                >
                  Request
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-blue-400 border border-blue-400 rounded-lg font-semibold px-6 py-2 ml-2 shadow cursor-not-allowed opacity-60"
                  disabled
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
              </>
            )}
            {/* Requested and Message buttons if request is pending (sent by user) */}
            {!isConnected && isRequested && !isPendingReceived && (
              <>
                <Button
                  variant="outline"
                  className="bg-white text-gray-400 border border-gray-300 rounded-lg font-semibold px-6 py-2 shadow cursor-not-allowed"
                  disabled
                >
                  Requested
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-blue-400 border border-blue-400 rounded-lg font-semibold px-6 py-2 ml-2 shadow cursor-not-allowed opacity-60"
                  disabled
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
              </>
            )}
            {/* Friends and Message buttons if connected */}
            {isConnected && (
              <>
                <Button
                  variant="outline"
                  className="bg-green-900 text-white border border-green-900 hover:bg-green-800"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={loading}
                >
                  Friends
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg font-semibold px-6 py-2 ml-2"
                  onClick={() => navigate(`/messages`, { state: { selectedConversation: profile.id } })}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
                {/* Remove Friend Dialog */}
                <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Friend</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to remove this user from your friends?</p>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleRemoveConnection} disabled={loading}>Yes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
=======
            <Button 
              onClick={handleConnectionRequest}
              className={`flex items-center gap-2 ${isRequested ? '' : 'bg-white border border-white text-black hover:bg-gray-100 hover:border-gray-200'}`}
              style={isRequested ? { backgroundColor: '#36454F', color: 'white', border: 'none' } : {}}
            >
              {isRequested ? <UserCheck className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-black" />}
              {isRequested ? 'Requested' : 'Request'}
            </Button>
            <Button variant="outline" disabled={!isConnected} title={!isConnected ? 'You must be connected to message' : undefined}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            {/* Three-dot menu for reporting (mobile only) is now handled by showMenuOnly at the top left */}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
          </>
        )}
      </div>
    </div>
<<<<<<< HEAD
  );
};
=======
  )
}
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
