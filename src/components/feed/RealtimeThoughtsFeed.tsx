import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from './ThoughtCard';
import { useRealtime } from '@/hooks/useRealtime';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Thought {
  id: string;
  content: string;
  image_url?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
    username: string;
  };
}

export const RealtimeThoughtsFeed = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onlineUsers } = useUserPresence('thoughts-feed');

  const fetchThoughts = async () => {
    try {
      setError(null);
      const { data: thoughtsData, error: fetchError } = await supabase
        .from('thoughts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            college_name,
            college_verified,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error('Error fetching thoughts:', fetchError);
        setError('Failed to load thoughts');
        return;
      }

      if (thoughtsData) {
        const formattedThoughts = thoughtsData.map(thought => ({
          id: thought.id,
          content: thought.content,
          image_url: thought.image_url,
          tags: thought.tags || [],
          likes_count: thought.likes_count || 0,
          comments_count: thought.comments_count || 0,
          created_at: thought.created_at,
          user: {
            name: thought.profiles?.full_name || 'Anonymous',
            avatar: thought.profiles?.avatar_url || '',
            college: thought.profiles?.college_name || '',
            verified: thought.profiles?.college_verified || false,
            username: thought.profiles?.username || ''
          }
        }));
        setThoughts(formattedThoughts);
      }
    } catch (err) {
      console.error('Error in fetchThoughts:', err);
      setError('Failed to load thoughts');
    } finally {
      setLoading(false);
    }
  };

  useRealtime({
    table: 'thoughts',
    onUpdate: fetchThoughts
  });

  useRealtime({
    table: 'thought_likes',
    onUpdate: fetchThoughts
  });

  useRealtime({
    table: 'thought_comments',
    onUpdate: fetchThoughts
  });

  useEffect(() => {
    fetchThoughts();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading thoughts...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 text-center">
        <p>{error}</p>
        <button 
          onClick={fetchThoughts}
          className="mt-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Online Users Indicator */}
      <div className="flex items-center space-x-2 p-4 backdrop-blur-sm bg-[#10151f]/80 border border-white/10 rounded-lg">
        <Users className="w-4 h-4 text-gray-300" />
        <span className="text-sm text-gray-300">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
        </span>
        <div className="flex space-x-1">
          {onlineUsers.slice(0, 3).map((user, index) => (
            <Badge key={user.user_id} variant="outline" className="text-xs bg-white/20 text-white border-white/10">
              {user.username}
            </Badge>
          ))}
          {onlineUsers.length > 3 && (
            <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/10">
              +{onlineUsers.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Thoughts List */}
      {thoughts.map((thought) => (
        <ThoughtCard
          key={thought.id}
          content={thought.content}
          author={thought.user}
          timestamp={thought.created_at}
          likes={thought.likes_count}
          comments={thought.comments_count}
          tags={thought.tags}
          image={thought.image_url}
        />
      ))}

      {thoughts.length === 0 && (
        <div className="text-center py-12 text-gray-300">
          No thoughts yet. Be the first to share something!
        </div>
      )}
    </div>
  );
};
