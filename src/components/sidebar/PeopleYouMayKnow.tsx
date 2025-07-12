import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ExternalLink, UserPlus, User } from 'lucide-react';
import { useTrendingData } from '@/hooks/useTrendingData';
import { useConnection } from '@/hooks/useConnection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PeopleYouMayKnow = () => {
  const { suggestedUsers, loading } = useTrendingData();
  const { sendConnectionRequest } = useConnection();
  const navigate = useNavigate();

  const handleConnect = async (userId: string, userName: string) => {
    try {
      await sendConnectionRequest(userId);
      toast.success(`Connection request sent to ${userName}`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  if (loading) {
    return (
      <Card className="bg-[rgba(0,0,0,0.7)] shadow-2xl border border-white/10 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg text-white">
            <Users className="w-5 h-5" />
            <span>People you may know</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
              <div className="flex-1 space-y-1">
                <Skeleton className="w-20 h-4 bg-white/20" />
                <Skeleton className="w-24 h-3 bg-white/20" />
                <Skeleton className="w-16 h-3 bg-white/20" />
              </div>
              <Skeleton className="w-16 h-8 bg-white/20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[rgba(0,0,0,0.7)] shadow-2xl border border-white/10 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg text-white">
          <Users className="w-5 h-5" />
          <span>People you may know</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.length === 0 ? (
          <p className="text-gray-300 text-sm">No suggestions available</p>
        ) : (
          suggestedUsers.map((person) => (
            <div key={person.id} className="flex items-center space-x-3">
              <Avatar 
                className="w-10 h-10 cursor-pointer" 
                onClick={() => navigate(`/profile/${person.id}`)}
              >
                <AvatarImage src={person.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-sm">
                  <User className="w-6 h-6 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p 
                  className="font-medium text-sm truncate text-white cursor-pointer hover:text-white transition-colors"
                  onClick={() => navigate(`/profile/${person.id}`)}
                >
                  {person.username && person.username.trim() !== '' ? person.username : 'Unknown User'}
                </p>
                <p className="text-xs text-gray-300 truncate">{person.title}</p>
                <p className="text-xs text-gray-300">
                  {person.mutualConnections} mutual connections
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs bg-white/20 text-white border-white/20 hover:bg-white/30"
                onClick={() => handleConnect(person.id, person.name)}
              >
                <UserPlus className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm text-gray-300 hover:bg-white/10 hover:text-white"
          onClick={() => navigate('/connections')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Find more people
        </Button>
      </CardContent>
    </Card>
  );
};

export default PeopleYouMayKnow;
