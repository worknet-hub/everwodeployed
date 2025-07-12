import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Check, X, MessageCircle, Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '@/hooks/useRealtime';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface Connection {
  connection_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar: string;
  status: string;
  created_at: string;
  requester_id: string;
  addressee_id: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  skills: string[];
  interests: string[];
  college_name?: string; // Added for college name
  username?: string; // Added for username
}

export const ConnectionsView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_connections', {
        p_user_id: user.id
      });
      console.log('Fetched connections after delete:', data); // Debug log
      if (error) {
        console.error('Error fetching connections:', error);
        toast.error('Failed to fetch connections');
      } else {
        setConnections((data || []).map((c: any) => ({
          requester_id: c.requester_id || '',
          addressee_id: c.addressee_id || '',
          ...c
        })));
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
      toast.error('Failed to fetch connections');
    }
  }, [user?.id]);

  const fetchCurrentUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, skills, interests, college_name, username')
        .eq('id', user.id)
        .single();

      if (data) {
        setCurrentUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, [user?.id]);

  // Add real-time updates for connections and profiles
  useRealtime({
    table: 'connections',
    onUpdate: fetchConnections
  });

  useRealtime({
    table: 'profiles',
    onUpdate: () => {
      fetchCurrentUserProfile();
      if (searchTerm) {
        searchUsers();
      }
    }
  });

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, skills, interests, college_name, username')
        .neq('id', user.id)
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,skills.cs.{${searchTerm}},interests.cs.{${searchTerm}}`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } else {
        setSearchResults(data || []);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      toast.error('Failed to search users');
    }
    setLoading(false);
  };

  const getCommonInterests = (userInterests: string[], searchedUserInterests: string[]) => {
    if (!userInterests || !searchedUserInterests) return [];
    return userInterests.filter(interest => searchedUserInterests.includes(interest));
  };

  const sendConnectionRequest = async (addresseeId: string, profile?: Profile) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending connection request:', error);
        toast.error('Failed to send connection request');
      } else {
        // Optimistically update connections state
        setConnections(prev => [
          ...prev,
          {
            connection_id: data.id,
            partner_id: addresseeId,
            partner_name: profile?.full_name || '',
            partner_avatar: profile?.avatar_url || null,
            status: 'pending',
            created_at: data.created_at,
            requester_id: user.id,
            addressee_id: addresseeId,
          }
        ]);
        // Remove from searchResults immediately
        setSearchResults(prev => prev.filter(u => u.id !== addresseeId));
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error('Failed to send connection request');
    }
  };

  const handleConnectionRequest = async (connectionId: string, action: 'accepted' | 'rejected') => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: action })
        .eq('id', connectionId);

      if (error) {
        console.error('Error updating connection:', error);
        toast.error(`Failed to ${action === 'accepted' ? 'accept' : 'reject'} connection request`);
      } else {
        toast.success(`Connection request ${action === 'accepted' ? 'accepted' : 'rejected'}!`);
        
        fetchConnections();
      }
    } catch (err) {
      console.error('Error updating connection:', err);
      toast.error(`Failed to ${action === 'accepted' ? 'accept' : 'reject'} connection request`);
    }
  };

  const startConversation = (partnerId: string) => {
    navigate('/messages', { state: { selectedConversation: partnerId } });
  };

  useEffect(() => {
    if (user?.id) {
      fetchConnections();
      fetchCurrentUserProfile();
    }
  }, [fetchConnections, fetchCurrentUserProfile, user?.id]);

  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  // Fix: pendingSent and pendingReceived should be arrays of Connection, not booleans
  const pendingSentArr = connections.filter(
    c => c.status === 'pending' && c.requester_id === user.id
  );
  const pendingReceivedArr = connections.filter(
    c => c.status === 'pending' && c.addressee_id === user.id
  );

  // Fetch all profiles except current user
  const fetchAllProfiles = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, skills, interests, college_name, username')
        .neq('id', user.id);
      if (error) {
        console.error('Error fetching all profiles:', error);
      } else {
        setAllProfiles(data || []);
      }
    } catch (err) {
      console.error('Error fetching all profiles:', err);
    }
  }, [user?.id]);

  // Fetch all profiles when user or their profile is loaded
  useEffect(() => {
    if (user?.id && currentUserProfile) {
      fetchAllProfiles();
    }
  }, [user?.id, currentUserProfile, fetchAllProfiles]);

  // Helper to check connection/request status
  const getConnectionStatus = (profileId: string) => {
    // Sent: current user is requester, status is pending
    const sent = connections.some(
      c => c.partner_id === profileId && c.status === 'pending' && c.requester_id === user.id
    );
    // Received: current user is addressee, status is pending
    const received = connections.some(
      c => c.partner_id === profileId && c.status === 'pending' && c.addressee_id === user.id
    );
    // Accepted: already connected
    const accepted = connections.some(
      c => c.partner_id === profileId && c.status === 'accepted'
    );
    return { sent, received, accepted };
  };

  // Handler for connect button
  const handleConnectClick = (profile: Profile) => {
    const { sent, received } = getConnectionStatus(profile.id);
    if (received) {
      // Redirect to requests tab, scroll and highlight
      setTimeout(() => {
        const el = document.getElementById(`request-${received.connection_id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedRequestId(received.connection_id);
          setTimeout(() => setHighlightedRequestId(null), 3000);
        }
      }, 100); // Wait for tab switch
      document.querySelector('[data-state="requests"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    } else if (!sent) {
      sendConnectionRequest(profile.id, profile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-0 sm:p-6 border-0 shadow-none rounded-none">
      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search"><Search className="w-5 h-5 inline" /></TabsTrigger>
          <TabsTrigger value="requests"><UserPlus className="w-5 h-5 inline" /></TabsTrigger>
          <TabsTrigger value="connections"><Users className="w-5 h-5 inline" /></TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                My Connections ({acceptedConnections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedConnections.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No connections yet. Start by searching for people to connect with!
                </p>
              ) : (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {acceptedConnections.map((connection) => (
                    <div key={connection.connection_id} className="flex items-center justify-between p-4 bg-transparent">
                      <div className="flex items-center space-x-3">
                        <div className="cursor-pointer" onClick={() => navigate(`/profile/${connection.partner_id}`)}>
                          <Avatar>
                            <AvatarImage src={connection.partner_avatar} />
                            <AvatarFallback>
                              <User className="w-6 h-6 text-gray-300" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${connection.partner_id}`)}>{connection.partner_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Connected {new Date(connection.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => startConversation(connection.partner_id)}
                          size="sm"
                          className="flex items-center justify-center"
                          aria-label="Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:bg-red-500/10"
                              aria-label="Remove Connection"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            className="max-w-xs rounded-2xl sm:max-w-lg"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this connection? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    console.log('Attempting to delete connection:', connection);
                                    const { error, data } = await supabase
                                      .from('connections')
                                      .delete()
                                      .eq('id', connection.connection_id);
                                    console.log('Delete result:', { error, data });
                                    fetchConnections();
                                  } catch (err) {
                                    // Optionally handle error
                                  }
                                }}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle>Pending Requests You Received ({pendingReceivedArr.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReceivedArr.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending connection requests.
                </p>
              ) : (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {pendingReceivedArr.map((request) => (
                    <div
                      key={request.connection_id}
                      id={`request-${request.connection_id}`}
                      className={`flex items-center justify-between p-4 bg-transparent transition-shadow duration-300 ${highlightedRequestId === request.connection_id ? 'ring-4 ring-green-400' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>
                          <Avatar>
                            <AvatarImage src={request.partner_avatar} />
                            <AvatarFallback>
                              <User className="w-6 h-6 text-gray-300" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>{request.partner_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sent {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleConnectionRequest(request.connection_id, 'accepted')}
                          size="sm"
                          variant="default"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleConnectionRequest(request.connection_id, 'rejected')}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="w-full h-px bg-white opacity-20 my-6" />
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle>Requests You Sent ({pendingSentArr.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSentArr.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  You have not sent any pending requests.
                </p>
              ) : (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {pendingSentArr.map((request) => (
                    <div
                      key={request.connection_id}
                      className="flex items-center justify-between p-4 bg-transparent"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>
                          <Avatar>
                            <AvatarImage src={request.partner_avatar} />
                            <AvatarFallback>
                              <User className="w-6 h-6 text-gray-300" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>{request.partner_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sent {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            // Cancel the sent request (delete the connection row)
                            try {
                              const { error, data } = await supabase
                                .from('connections')
                                .delete()
                                .eq('id', request.connection_id);
                              fetchConnections();
                            } catch (err) {
                              // Optionally handle error
                            }
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle>Find People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full flex gap-2 items-center rounded-lg border-2 border-white opacity-60 px-2 py-1">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 profile-input border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 bg-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  />
                </div>
                <Button onClick={searchUsers} disabled={loading} className="bg-transparent border-0 shadow-none hover:bg-transparent p-0 focus:border-0">
                  <Search className="w-5 h-5 text-gray-400 hover:text-white" />
                </Button>
              </div>
              <div className="w-full h-px bg-white opacity-20 my-2" />

              {(searchTerm ? searchResults : allProfiles).length > 0 && (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {(searchTerm ? searchResults : allProfiles).map((profile, idx, arr) => {
                    const commonInterests = getCommonInterests(currentUserProfile?.interests || [], profile.interests || []);
                    const { sent, received, accepted } = getConnectionStatus(profile.id);
                    const isRequested = sent;
                    const isAccepted = accepted;
                    // If accepted, do not show in search results
                    if (isAccepted) return null;
                    return (
                      <>
                        <div key={profile.id} className="p-6 min-h-[180px] bg-black/60 flex flex-col items-center relative">
                          {/* University name at top right */}
                          {profile.college_name && (
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-2xl bg-blue-600/30 text-white text-xs font-medium w-fit backdrop-blur">
                              {profile.college_name}
                            </div>
                          )}
                          {/* Avatar at top center */}
                          <div className="flex flex-col items-center w-full">
                            <div className="cursor-pointer mb-2" onClick={() => navigate(`/profile/${profile.id}`)}>
                              <Avatar className="w-14 h-14 mx-auto">
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback>
                                  <User className="w-8 h-8 text-gray-300" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <h3 className="font-semibold text-lg cursor-pointer mb-2" onClick={() => navigate(`/profile/${profile.id}`)}>{profile.username || 'unknown-user'}</h3>
                            {/* Interests in a single line */}
                            {profile.interests && profile.interests.length > 0 && (
                              <div className="flex flex-col w-full mb-1">
                                <span className="text-xs text-muted-foreground mb-1 self-center text-center">Interests:</span>
                                <div className="flex flex-wrap gap-2 justify-start">
                                  {profile.interests.slice(0, 4).map((interest) => (
                                    <Badge 
                                      key={interest} 
                                      style={{ backgroundColor: '#3A3736', color: '#fff', border: 'none' }} 
                                      className="text-xs"
                                    >
                                      {interest}
                                    </Badge>
                                  ))}
                                  {profile.interests.length > 4 && (
                                    <span className="text-xs text-muted-foreground">+{profile.interests.length - 4} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Common interests in a single line */}
                            {commonInterests.length > 0 && (
                              <div className="flex flex-row flex-wrap gap-2 justify-center items-center w-full mt-1">
                                <span className="text-xs" style={{ color: '#E9E5E4' }} mr-2>Common:</span>
                                {commonInterests.map((interest) => (
                                  <Badge key={interest} style={{ backgroundColor: '#E9E5E4', color: '#1D4ED8', border: 'none' }} className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Connect button below common interests */}
                          <div className="w-full flex justify-center mt-4 mb-8">
                            <Button
                              onClick={() => handleConnectClick(profile)}
                              size="sm"
                              className={`flex items-center gap-2 ${isRequested ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-white border border-white text-black hover:bg-gray-100 hover:border-gray-200'}`}
                              disabled={isRequested}
                            >
                              <UserPlus className={`w-4 h-4 ${isRequested ? 'text-white' : 'text-black'}`} />
                              {isRequested ? 'Requested' : 'Request'}
                            </Button>
                          </div>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className="w-full h-px bg-white opacity-20 my-2" />
                        )}
                      </>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
